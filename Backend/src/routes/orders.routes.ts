import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config.js';
import { sendOrderConfirmationEmail } from '../lib/email.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { orderSchema } from '../schemas.js';

const router = Router();

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

  try {
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

    return res.status(201).json({ order });
  } catch (error) {
    return res.status(500).json({ message: 'Could not place order', error: String(error) });
  }
});

export default router;
