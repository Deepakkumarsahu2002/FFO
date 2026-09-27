import { Router } from 'express';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { addressSchema } from '../schemas.js';

const router = Router();

router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const orders = await Order.find({ userId: req.params.userId }).lean();
    return res.json({
      user: { id: user._id.toString(), name: user.name, email: user.email, phone: user.phone },
      addresses: user.addresses,
      orders,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Could not load account details', error: String(error) });
  }
});

router.post('/:userId/addresses', async (req, res) => {
  const parsed = addressSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid address payload', errors: parsed.error.flatten() });
  }

  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const address = {
      id: `ADDR-${Date.now()}`,
      ...parsed.data,
    };

    user.addresses.push(address);
    await user.save();

    return res.status(201).json({ address });
  } catch (error) {
    return res.status(500).json({ message: 'Could not save address', error: String(error) });
  }
});

router.delete('/:userId/addresses/:addressId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.addresses = user.addresses.filter((address: { id: string }) => address.id !== req.params.addressId);
    await user.save();

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Could not remove address', error: String(error) });
  }
});

export default router;
