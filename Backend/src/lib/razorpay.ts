import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import { env } from '../config.js';
import { sendOrderConfirmationEmail } from './email.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import type { razorpayCheckoutSchema } from '../schemas.js';
import type { z } from 'zod';

export type RazorpayCheckoutInput = z.infer<typeof razorpayCheckoutSchema>;

export class RazorpayConfigurationError extends Error {}
export class InventoryUnavailableError extends Error {}
export class PaymentNotCapturedError extends Error {}
export class PaymentProcessingError extends Error {}

let razorpayClient: Razorpay | null = null;

function client() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret || !env.razorpayWebhookSecret) {
    throw new RazorpayConfigurationError('Razorpay keys and webhook secret must be configured on the server.');
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: env.razorpayKeyId,
      key_secret: env.razorpayKeySecret,
    });
  }

  return razorpayClient;
}

function calculateTotals(subtotal: number) {
  const delivery = subtotal >= 1499 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  return { subtotal, discount: 0, delivery, tax, total: subtotal + delivery + tax };
}

function toPaise(amount: number) {
  return Math.round(amount * 100);
}

export async function createRazorpayOrder(userId: string, input: RazorpayCheckoutInput) {
  const existing = await Order.findOne({ userId, checkoutId: input.checkoutId });
  if (existing?.razorpayOrderId && existing.paymentStatus === 'pending') {
    return {
      orderId: existing.id,
      razorpayOrderId: existing.razorpayOrderId,
      amount: toPaise(existing.total),
      currency: 'INR',
      keyId: env.razorpayKeyId,
      totals: existing.totals,
    };
  }
  if (existing && existing.paymentStatus !== 'failed') {
    throw new Error('This checkout attempt has already been used. Start checkout again.');
  }

  const quantities = new Map<string, number>();
  for (const item of input.items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.qty);
  }

  const products = await Product.find({ id: { $in: [...quantities.keys()] } }).lean();
  const productById = new Map(products.map((product) => [product.id, product]));
  const orderItems = input.items.map((item) => {
    const product = productById.get(item.productId);
    if (!product) {
      throw new InventoryUnavailableError('A product in your cart is no longer available.');
    }
    const requestedQuantity = quantities.get(item.productId) ?? 0;
    if (product.stock < requestedQuantity) {
      throw new InventoryUnavailableError(`Only ${product.stock} unit(s) of ${product.name} are available.`);
    }
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? '',
      price: product.price,
      mrp: product.mrp,
      qty: item.qty,
      variant: item.variant,
      message: item.message,
      addons: item.addons,
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totals = calculateTotals(subtotal);
  if (totals.total <= 0) throw new Error('Order total must be greater than zero.');
  const orderId = `FF${Date.now().toString().slice(-8)}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const paymentOrder = await client().orders.create({
    amount: toPaise(totals.total),
    currency: 'INR',
    receipt: orderId,
    notes: { app_order_id: orderId, user_id: userId },
  });

  try {
    const orderValues = {
      id: orderId,
      checkoutId: input.checkoutId,
      razorpayOrderId: paymentOrder.id,
      items: orderItems,
      address: { ...input.address, id: `ADDR-${randomUUID().slice(0, 12)}` },
      payment: 'Razorpay',
      paymentStatus: 'pending',
      paymentExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
      totals,
      total: totals.total,
      placedAt: new Date(),
      status: 'Payment Pending',
    };

    if (existing) {
      const retriedOrder = await Order.findOneAndUpdate(
        { _id: existing._id, paymentStatus: 'failed' },
        {
          $set: { ...orderValues, paymentStatus: 'pending' },
          $unset: { razorpayPaymentId: 1, paymentProcessingAt: 1 },
        },
        { new: true, runValidators: true },
      );
      if (!retriedOrder) throw new Error('Checkout was already retried. Please reopen checkout.');
    } else {
      await Order.create({ userId, ...orderValues, paymentStatus: 'pending' });
    }
  } catch (error) {
    const racedOrder = await Order.findOne({ userId, checkoutId: input.checkoutId });
    if (racedOrder?.razorpayOrderId && racedOrder.paymentStatus === 'pending') {
      return {
        orderId: racedOrder.id,
        razorpayOrderId: racedOrder.razorpayOrderId,
        amount: toPaise(racedOrder.total),
        currency: 'INR',
        keyId: env.razorpayKeyId,
        totals: racedOrder.totals,
      };
    }
    throw error;
  }

  return {
    orderId,
    razorpayOrderId: paymentOrder.id,
    amount: toPaise(totals.total),
    currency: 'INR',
    keyId: env.razorpayKeyId,
    totals,
  };
}

export function verifyCheckoutSignature(razorpayOrderId: string, paymentId: string, signature: string) {
  if (!env.razorpayKeySecret || !/^[a-f\d]{64}$/i.test(signature)) return false;
  const expected = createHmac('sha256', env.razorpayKeySecret)
    .update(`${razorpayOrderId}|${paymentId}`)
    .digest();
  const provided = Buffer.from(signature, 'hex');
  return provided.length === expected.length && expected.length > 0 && timingSafeEqual(expected, provided);
}

export async function confirmCapturedPayment(
  razorpayOrderId: string,
  paymentId: string,
  userId?: string,
  orderId?: string,
) {
  const query = {
    razorpayOrderId,
    ...(userId ? { userId } : {}),
    ...(orderId ? { id: orderId } : {}),
  };
  const existing = await Order.findOne(query);
  if (!existing) throw new PaymentProcessingError('Payment order was not found.');
  if (existing.paymentStatus === 'paid' && existing.razorpayPaymentId === paymentId) {
    return { order: existing, stockUpdates: [] as Array<{ id: string; stock: number }> };
  }
  if (existing.paymentStatus === 'failed' || existing.paymentStatus === 'refunded') {
    throw new PaymentProcessingError('This payment attempt is no longer active.');
  }

  const staleProcessingTime = new Date(Date.now() - 2 * 60 * 1000);
  const claimed = await Order.findOneAndUpdate(
    {
      ...query,
      $or: [
        { paymentStatus: 'pending' },
        { paymentStatus: 'processing', paymentProcessingAt: { $lt: staleProcessingTime } },
      ],
    },
    {
      $set: {
        paymentStatus: 'processing',
        status: 'Payment Processing',
        paymentProcessingAt: new Date(),
        razorpayPaymentId: paymentId,
      },
    },
    { new: true },
  );

  if (!claimed) {
    const latest = await Order.findOne(query);
    if (latest?.paymentStatus === 'paid' && latest.razorpayPaymentId === paymentId) {
      return { order: latest, stockUpdates: [] as Array<{ id: string; stock: number }> };
    }
    if (latest?.paymentStatus === 'processing') return { processing: true as const };
    throw new PaymentProcessingError('This payment cannot be confirmed.');
  }

  const gateway = client();
  let payment;
  try {
    payment = await gateway.payments.fetch(paymentId);
    if (
      payment.order_id !== razorpayOrderId ||
      Number(payment.amount) !== toPaise(claimed.total) ||
      payment.currency !== 'INR'
    ) {
      throw new PaymentProcessingError('The payment details do not match this order.');
    }

    if (payment.status === 'authorized') {
      payment = await gateway.payments.capture(paymentId, toPaise(claimed.total), 'INR');
    }
    if (payment.status !== 'captured') {
      throw new PaymentNotCapturedError('Razorpay has not captured this payment yet.');
    }
  } catch (error) {
    if (error instanceof PaymentProcessingError || error instanceof PaymentNotCapturedError) {
      await Order.updateOne(
        { _id: claimed._id, paymentStatus: 'processing' },
        { $set: { paymentStatus: 'pending', status: 'Payment Pending' }, $unset: { paymentProcessingAt: 1 } },
      );
      throw error;
    }
    await Order.updateOne(
      { _id: claimed._id, paymentStatus: 'processing' },
      { $set: { paymentStatus: 'pending', status: 'Payment Pending' }, $unset: { paymentProcessingAt: 1 } },
    );
    throw new PaymentProcessingError('Could not verify the payment with Razorpay. Please retry.');
  }

  const quantities = new Map<string, number>();
  for (const item of claimed.items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.qty);
  }

  const session = await mongoose.startSession();
  const stockUpdates: Array<{ id: string; stock: number }> = [];
  try {
    await session.withTransaction(async () => {
      stockUpdates.length = 0;
      for (const [productId, quantity] of quantities) {
        const product = await Product.findOneAndUpdate(
          { id: productId, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { new: true, session },
        );
        if (!product) {
          const current = await Product.findOne({ id: productId }).session(session).lean();
          throw new InventoryUnavailableError(
            current
              ? `Only ${current.stock} unit(s) remain for ${claimed.items.find((item: { productId: string; name: string }) => item.productId === productId)?.name ?? 'a product'}.`
              : 'A product in this order is no longer available.',
          );
        }
        stockUpdates.push({ id: product.id, stock: product.stock });
      }

      const updated = await Order.findOneAndUpdate(
        { _id: claimed._id, paymentStatus: 'processing', razorpayPaymentId: paymentId },
        {
          $set: {
            paymentStatus: 'paid',
            payment: 'Razorpay',
            status: 'Placed',
            placedAt: new Date(),
          },
          $unset: { paymentProcessingAt: 1, paymentExpiresAt: 1 },
        },
        { new: true, session },
      );
      if (!updated) throw new PaymentProcessingError('Could not finalize this order.');
    });
  } catch (error) {
    if (error instanceof InventoryUnavailableError) {
      let refundStatus: 'refunded' | 'refund_pending' = 'refund_pending';
      try {
        const refund = await gateway.payments.refund(paymentId, { amount: toPaise(claimed.total) });
        if (refund.status === 'processed') refundStatus = 'refunded';
      } catch {
        refundStatus = 'refund_pending';
      }
      await Order.updateOne(
        { _id: claimed._id, paymentStatus: 'processing' },
        { $set: { paymentStatus: refundStatus, status: 'Payment Failed' }, $unset: { paymentProcessingAt: 1, paymentExpiresAt: 1 } },
      );
      throw new InventoryUnavailableError(`${error.message} Payment ${refundStatus === 'refunded' ? 'was refunded' : 'refund is being processed'}.`);
    }
    await Order.updateOne(
      { _id: claimed._id, paymentStatus: 'processing' },
      { $set: { paymentStatus: 'pending', status: 'Payment Pending' }, $unset: { paymentProcessingAt: 1 } },
    );
    throw new PaymentProcessingError('Payment was received, but order confirmation is still processing. Please retry shortly.');
  } finally {
    await session.endSession();
  }

  const order = await Order.findById(claimed._id);
  if (!order) throw new PaymentProcessingError('The confirmed order could not be loaded.');

  try {
    const user = await User.findById(order.userId);
    if (user) {
      await sendOrderConfirmationEmail(user.email, user.name, {
        id: order.id,
        total: order.total,
        payment: order.payment,
        items: order.items.map((item: { name: string; qty: number }) => ({ name: item.name, qty: item.qty })),
      });
    }
  } catch (emailError) {
    console.error('Paid order confirmation email failed:', emailError);
  }

  return { order, stockUpdates };
}

export async function finalizeProcessedRefund(paymentId: string) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const order = await Order.findOne({
        razorpayPaymentId: paymentId,
        paymentStatus: 'refund_pending',
      }).session(session);
      if (!order) return;

      if (!order.inventoryRestoredOnRefund) {
        const quantities = new Map<string, number>();
        for (const item of order.items) {
          quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.qty);
        }
        for (const [productId, quantity] of quantities) {
          await Product.updateOne({ id: productId }, { $inc: { stock: quantity } }, { session });
        }
      }

      await Order.updateOne(
        { _id: order._id, paymentStatus: 'refund_pending' },
        { $set: { paymentStatus: 'refunded', inventoryRestoredOnRefund: true } },
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
}

export async function cancelPaidOrder(orderId: string, userId: string) {
  const claimed = await Order.findOneAndUpdate(
    { id: orderId, userId, status: 'Placed', paymentStatus: 'paid' },
    { $set: { status: 'Cancelled', paymentStatus: 'refund_pending' } },
    { new: true },
  );
  if (!claimed) return null;
  if (!claimed.razorpayPaymentId) {
    await Order.updateOne(
      { _id: claimed._id, paymentStatus: 'refund_pending' },
      { $set: { status: 'Placed', paymentStatus: 'paid' } },
    );
    throw new PaymentProcessingError('This paid order has no gateway payment reference. Contact support.');
  }

  let refund;
  try {
    refund = await client().payments.refund(claimed.razorpayPaymentId, { amount: toPaise(claimed.total) });
  } catch {
    await Order.updateOne(
      { _id: claimed._id, paymentStatus: 'refund_pending' },
      { $set: { status: 'Placed', paymentStatus: 'paid' } },
    );
    throw new PaymentProcessingError('Razorpay could not start the refund. The order remains active.');
  }

  if (refund.status === 'failed') {
    await Order.updateOne(
      { _id: claimed._id, paymentStatus: 'refund_pending' },
      { $set: { status: 'Placed', paymentStatus: 'paid' } },
    );
    throw new PaymentProcessingError('Razorpay could not process the refund. The order remains active.');
  }

  if (refund.status === 'processed') {
    try {
      await finalizeProcessedRefund(claimed.razorpayPaymentId);
    } catch (error) {
      console.error('Refund processed but order inventory finalization is pending:', error);
    }
  }

  return Order.findById(claimed._id);
}
