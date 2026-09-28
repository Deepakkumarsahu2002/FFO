import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config.js';
import { sendOrderConfirmationEmail } from '../lib/email.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { orderSchema } from '../schemas.js';

const router = Router();

class InventoryError extends Error {}

async function restoreInventory(reservations: Array<{ productId: string; quantity: number }>) {
  await Promise.all(
    reservations.map(({ productId, quantity }) =>
      Product.updateOne({ id: productId }, { $inc: { stock: quantity } }),
    ),
  );
}

router.get('/orders/:userId', async (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return res.status(401).json({ message: 'Login required to load orders.' });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload;
    if (payload.sub !== req.params.userId) {
      return res.status(403).json({ message: 'You can only view your own orders.' });
    }
  } catch {
    return res.status(401).json({ message: 'Session expired. Log in again to view orders.' });
  }

  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ placedAt: -1 }).lean();
    res.json({ items: orders });
  } catch (error) {
    res.status(500).json({ message: 'Could not load orders', error: String(error) });
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
    const order = await Order.findOneAndUpdate(
      { id: req.params.id, userId, status: 'Placed' },
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

router.post('/orders', async (req, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid order payload', errors: parsed.error.flatten() });
  }

  const reservations: Array<{ productId: string; quantity: number; stock: number }> = [];

  try {
    const quantities = new Map<string, { quantity: number; name: string }>();
    for (const item of parsed.data.items) {
      const current = quantities.get(item.productId);
      quantities.set(item.productId, {
        quantity: (current?.quantity ?? 0) + item.qty,
        name: item.name,
      });
    }

    for (const [productId, item] of quantities) {
      const product = await Product.findOneAndUpdate(
        { id: productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true },
      );

      if (!product) {
        const existing = await Product.findOne({ id: productId }).select('stock').lean();
        if (!existing) {
          throw new InventoryError(`${item.name} is no longer available.`);
        }
        throw new InventoryError(`Only ${existing.stock} unit(s) of ${item.name} are available.`);
      }

      reservations.push({ productId, quantity: item.quantity, stock: product.stock });
    }

    const order = await Order.create({
      id: `FF${Date.now().toString().slice(-8)}`,
      userId: parsed.data.userId,
      items: parsed.data.items,
      address: {
        ...parsed.data.address,
        id: `ADDR-${Date.now()}`,
      },
      payment: parsed.data.payment,
      totals: parsed.data.totals,
      total: parsed.data.totals.total,
      placedAt: new Date(),
      status: 'Placed',
    });

    try {
      const user = await User.findById(parsed.data.userId);
      if (user) {
        await sendOrderConfirmationEmail(user.email, user.name, {
          id: order.id,
          total: order.total,
          payment: order.payment,
          items: order.items.map((item: { name: string; qty: number }) => ({
            name: item.name,
            qty: item.qty,
          })),
        });
      }
    } catch (emailError) {
      console.error('Order saved but confirmation email could not be sent:', emailError);
    }

    return res.status(201).json({
      order,
      stockUpdates: reservations.map(({ productId, stock }) => ({ id: productId, stock })),
    });
  } catch (error) {
    if (reservations.length > 0) {
      try {
        await restoreInventory(reservations);
      } catch (restoreError) {
        console.error('Failed to restore inventory after order error:', restoreError);
      }
    }
    if (error instanceof InventoryError) {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Could not place order', error: String(error) });
  }
});

export default router;
