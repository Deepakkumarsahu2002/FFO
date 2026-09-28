import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../config.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import {
  confirmCapturedPayment,
  createRazorpayOrder,
  InventoryUnavailableError,
  PaymentNotCapturedError,
  PaymentProcessingError,
  RazorpayConfigurationError,
  verifyCheckoutSignature,
  cancelPaidOrder,
  finalizeProcessedRefund,
} from '../lib/razorpay.js';
import { razorpayCheckoutSchema, razorpayVerificationSchema } from '../schemas.js';

const router = Router();

function getAuthenticatedUserId(req: import('express').Request) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  try {
    const payload = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload;
    return typeof payload.sub === 'string' && payload.sub !== 'admin' ? payload.sub : null;
  } catch {
    return null;
  }
}

function hasValidWebhookSignature(body: Buffer, signature: string) {
  if (!env.razorpayWebhookSecret || !/^[a-f\d]{64}$/i.test(signature)) return false;
  const expected = createHmac('sha256', env.razorpayWebhookSecret).update(body).digest();
  const provided = Buffer.from(signature, 'hex');
  return provided.length === expected.length && timingSafeEqual(expected, provided);
}

router.get('/orders/:userId', async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ message: 'Login required to load orders.' });
  }
  if (userId !== req.params.userId) {
    return res.status(403).json({ message: 'You can only view your own orders.' });
  }

  try {
    const orders = await Order.find({
      userId,
      $or: [
        { paymentStatus: { $in: ['paid', 'refund_pending', 'refunded'] } },
        { paymentStatus: { $exists: false } },
      ],
    }).sort({ placedAt: -1 }).lean();
    res.json({ items: orders });
  } catch (error) {
    res.status(500).json({ message: 'Could not load orders', error: String(error) });
  }
});

router.get('/orders/razorpay/status/:orderId', async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ message: 'Log in to check payment status.' });

  try {
    const order = await Order.findOne({ id: req.params.orderId, userId }).lean();
    if (!order) return res.status(404).json({ message: 'Payment order not found.' });
    const stockUpdates = order.paymentStatus === 'paid'
      ? await Product.find({ id: { $in: order.items.map((item: { productId: string }) => item.productId) } })
          .select('id stock')
          .lean()
          .then((products) => products.map((product) => ({ id: product.id, stock: product.stock })))
      : [];
    return res.json({
      status: order.paymentStatus ?? 'paid',
      order: order.paymentStatus === 'paid' ? order : undefined,
      stockUpdates,
    });
  } catch {
    return res.status(500).json({ message: 'Could not check payment status.' });
  }
});

router.patch('/orders/:id/cancel', async (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return res.status(401).json({ message: 'Login required to cancel an order.' });
  }

  let userId: string;
  try {
    const payload = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload;
    if (typeof payload.sub !== 'string') {
      return res.status(401).json({ message: 'Invalid login session.' });
    }
    userId = payload.sub;
  } catch {
    return res.status(401).json({ message: 'Session expired. Log in again to cancel orders.' });
  }

  try {
    const existingOrder = await Order.findOne({ id: req.params.id, userId });
    if (existingOrder?.paymentStatus === 'paid') {
      const refundedOrder = await cancelPaidOrder(req.params.id, userId);
      if (!refundedOrder) {
        return res.status(409).json({ message: 'This order can no longer be cancelled.' });
      }
      return res.json({ order: refundedOrder, refundStatus: refundedOrder.paymentStatus });
    }

    const order = await Order.findOneAndUpdate(
      { id: req.params.id, userId, status: 'Placed', paymentStatus: { $exists: false } },
      { status: 'Cancelled' },
      { new: true, runValidators: true },
    ).lean();
    if (!order) {
      return res.status(409).json({ message: 'This order can no longer be cancelled.' });
    }
    return res.json({ order });
  } catch (error) {
    console.error('Failed to cancel order:', error);
    return res.status(500).json({ message: 'Could not cancel order.' });
  }
});

router.post('/orders/razorpay/create', async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ message: 'Log in before starting checkout.' });

  const parsed = razorpayCheckoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid checkout details.', errors: parsed.error.flatten() });
  }

  try {
    const result = await createRazorpayOrder(userId, parsed.data);
    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof RazorpayConfigurationError) return res.status(503).json({ message: error.message });
    if (error instanceof InventoryUnavailableError) {
      return res.status(409).json({ message: error.message });
    }
    console.error('Failed to create Razorpay order:', error);
    return res.status(502).json({ message: 'Could not start Razorpay checkout.' });
  }
});

router.post('/orders/razorpay/verify', async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ message: 'Log in to confirm payment.' });

  const parsed = razorpayVerificationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid Razorpay payment response.' });

  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;
  if (!hasValidCheckoutSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
    return res.status(400).json({ message: 'Razorpay payment signature is invalid.' });
  }

  try {
    const result = await confirmCapturedPayment(razorpayOrderId, razorpayPaymentId, userId, orderId);
    if ('processing' in result) return res.status(202).json({ status: 'processing', orderId });
    return res.json({ status: 'paid', order: result.order, stockUpdates: result.stockUpdates });
  } catch (error) {
    if (error instanceof InventoryUnavailableError) return res.status(409).json({ message: error.message });
    if (error instanceof PaymentNotCapturedError) return res.status(409).json({ message: error.message });
    if (error instanceof PaymentProcessingError) return res.status(409).json({ message: error.message });
    console.error('Razorpay payment verification failed:', error);
    return res.status(502).json({ message: 'Could not verify payment with Razorpay. Check order status before retrying.' });
  }
});

router.post('/orders', (_req, res) => {
  return res.status(410).json({ message: 'Direct order creation is disabled. Complete payment through Razorpay checkout.' });
});

export async function handleRazorpayWebhook(req: import('express').Request, res: import('express').Response) {
  if (!env.razorpayWebhookSecret) {
    return res.status(503).json({ message: 'Razorpay webhook is not configured.' });
  }
  if (!Buffer.isBuffer(req.body)) return res.status(400).json({ message: 'Invalid webhook payload.' });

  const signature = req.header('x-razorpay-signature') ?? '';
  if (!hasValidWebhookSignature(req.body, signature)) {
    return res.status(400).json({ message: 'Invalid webhook signature.' });
  }

  try {
    const event = JSON.parse(req.body.toString()) as {
      event?: string;
      payload?: {
        payment?: { entity?: { id?: string; order_id?: string } };
        refund?: { entity?: { payment_id?: string } };
      };
    };
    const payment = event.payload?.payment?.entity;
    if (!payment?.id || !payment.order_id) return res.status(400).json({ message: 'Webhook payment details are missing.' });

    if (event.event === 'payment.captured') {
      await confirmCapturedPayment(payment.order_id, payment.id);
    } else if (event.event === 'payment.failed') {
      await Order.updateOne(
        { razorpayOrderId: payment.order_id, paymentStatus: 'pending' },
        { $set: { paymentStatus: 'failed', status: 'Payment Failed' }, $unset: { paymentExpiresAt: 1 } },
      );
    } else if (event.event === 'refund.processed') {
      const paymentId = event.payload?.refund?.entity?.payment_id;
      if (paymentId) await finalizeProcessedRefund(paymentId);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook processing failed:', error);
    return res.status(500).json({ message: 'Webhook processing failed.' });
  }
}

function hasValidCheckoutSignature(orderId: string, paymentId: string, signature: string) {
  return verifyCheckoutSignature(orderId, paymentId, signature);
}

export default router;
