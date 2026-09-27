import { Router } from 'express';
import { timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import { z } from 'zod';
import { env } from '../config.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

const router = Router();

const productInputSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(2),
  category: z.enum(['pipe-cleaner-supplies', 'ready-bouquets', 'diy-flower-kits', 'home-decor']),
  subcategory: z.string(),
  shortDescription: z.string(),
  description: z.string(),
  price: z.number().nonnegative(),
  mrp: z.number().nonnegative(),
  rating: z.number().min(0).max(5),
  reviews: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  sku: z.string().min(1),
  images: z.array(z.string().url().refine((image) => !image.startsWith('data:'))).min(1).max(8),
  tags: z.array(z.string()),
  color: z.string(),
  flowerType: z.string().optional(),
  sameDay: z.boolean(),
  isBestSeller: z.boolean(),
  isFeatured: z.boolean(),
  isPremium: z.boolean(),
  care: z.string(),
  contains: z.array(z.string()),
});

const productPatchSchema = productInputSchema.omit({ id: true }).partial();

function verifyAdmin(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return res.status(401).json({ message: 'Admin session required.' });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload;
    if (payload.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }
    return next();
  } catch {
    return res.status(401).json({ message: 'Admin session expired. Sign in again.' });
  }
}

router.post('/session', (req, res) => {
  const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode : '';
  if (!env.adminPasscode) {
    return res.status(503).json({ message: 'Set ADMIN_PASSCODE in the backend environment first.' });
  }

  const supplied = Buffer.from(passcode);
  const expected = Buffer.from(env.adminPasscode);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return res.status(401).json({ message: 'Incorrect passcode.' });
  }

  const token = jwt.sign({ sub: 'admin', role: 'admin' }, env.jwtSecret, { expiresIn: '8h' });
  return res.json({ token, expiresIn: 28800 });
});

router.use(verifyAdmin);

router.get('/session', (_req, res) => {
  return res.json({ valid: true });
});

router.get('/overview', async (_req, res) => {
  try {
    const [orders, products, users] = await Promise.all([
      Order.find().lean(),
      Product.find().lean(),
      User.find().lean(),
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total ?? 0), 0);

    res.json({
      summary: {
        totalRevenue,
        totalOrders: orders.length,
        activeCustomers: users.length,
        lowStockProducts: products.filter((product) => product.stock <= 5).length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not load admin overview', error: String(error) });
  }
});

router.get('/orders', async (_req, res) => {
  try {
    const items = await Order.find().sort({ placedAt: -1 }).lean();
    return res.json({ items });
  } catch (error) {
    console.error('Failed to load admin orders:', error);
    return res.status(500).json({ message: 'Could not load orders.' });
  }
});

router.patch('/orders/:id/status', async (req, res) => {
  const parsedStatus = z.enum(['Placed', 'Preparing', 'Out for delivery', 'Delivered', 'Cancelled']).safeParse(req.body?.status);
  if (!parsedStatus.success) {
    return res.status(400).json({ message: 'Invalid status payload.' });
  }

  try {
    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { status: parsedStatus.data },
      { new: true, runValidators: true },
    ).lean();
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    return res.json({ order });
  } catch (error) {
    console.error('Failed to update order status:', error);
    return res.status(500).json({ message: 'Could not update order status.' });
  }
});

router.get('/customers', async (_req, res) => {
  try {
    const [users, orders] = await Promise.all([
      User.find().select('_id name email phone addresses').lean(),
      Order.find().select('userId total status placedAt address').lean(),
    ]);

    type CustomerSummary = {
      id: string;
      name: string;
      email: string;
      phone: string;
      city: string;
      pincode: string;
      orderCount: number;
      totalSpent: number;
      lastOrderAt: string | null;
    };

    const customers = new Map<string, CustomerSummary>();
    const customersById = new Map<string, CustomerSummary>();
    const customersByPhone = new Map<string, CustomerSummary>();

    for (const user of users) {
      const id = String(user._id);
      const address = user.addresses.at(-1);
      const customer: CustomerSummary = {
        id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: address?.city ?? '',
        pincode: address?.pincode ?? '',
        orderCount: 0,
        totalSpent: 0,
        lastOrderAt: null,
      };
      customers.set(id, customer);
      customersById.set(id, customer);
      customersByPhone.set(user.phone, customer);
    }

    for (const order of orders) {
      const customer = customersById.get(order.userId) ?? customersByPhone.get(order.address.phone);
      const id = customer?.id ?? `guest:${order.address.phone}`;
      const summary = customer ?? customers.get(id) ?? {
        id,
        name: order.address.name,
        email: '',
        phone: order.address.phone,
        city: order.address.city,
        pincode: order.address.pincode,
        orderCount: 0,
        totalSpent: 0,
        lastOrderAt: null,
      };

      if (!customer) customers.set(id, summary);
      if (order.status !== 'Cancelled') {
        summary.orderCount += 1;
        summary.totalSpent += order.total;
      }
      if (!summary.lastOrderAt || new Date(order.placedAt).getTime() > new Date(summary.lastOrderAt).getTime()) {
        summary.lastOrderAt = new Date(order.placedAt).toISOString();
      }
    }

    const items = Array.from(customers.values()).sort(
      (a, b) => new Date(b.lastOrderAt ?? 0).getTime() - new Date(a.lastOrderAt ?? 0).getTime(),
    );
    return res.json({ items });
  } catch (error) {
    console.error('Failed to load admin customers:', error);
    return res.status(500).json({ message: 'Could not load customer records.' });
  }
});

router.post('/images', async (req, res) => {
  const image = req.body?.image;
  if (typeof image !== 'string' || !/^data:image\/(jpeg|png|webp);base64,/.test(image)) {
    return res.status(400).json({ message: 'Upload a JPEG, PNG, or WebP image.' });
  }
  if (!env.cloudinaryUrl) {
    return res.status(503).json({ message: 'Cloudinary is not configured on the backend.' });
  }

  try {
    cloudinary.config(true);
    const result = await cloudinary.uploader.upload(image, {
      folder: 'flowers-forever/products',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    });
    return res.status(201).json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    console.error('Cloudinary product image upload failed:', error);
    return res.status(502).json({ message: 'Cloudinary could not store this image. Check the backend configuration.' });
  }
});

router.post('/products', async (req, res) => {
  const parsed = productInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid product details.', errors: parsed.error.flatten() });
  }

  try {
    const product = await Product.create(parsed.data);
    return res.status(201).json({ product: product.toObject() });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return res.status(409).json({ message: 'A product with this ID, slug, or SKU already exists.' });
    }
    console.error('Failed to create product:', error);
    return res.status(500).json({ message: 'Could not save product.' });
  }
});

router.put('/products/:id', async (req, res) => {
  const parsed = productInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid product details.', errors: parsed.error.flatten() });
  }
  if (parsed.data.id !== req.params.id) {
    return res.status(400).json({ message: 'Product ID cannot be changed.' });
  }

  try {
    const product = await Product.findOneAndUpdate({ id: req.params.id }, parsed.data, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    return res.json({ product: product.toObject() });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return res.status(409).json({ message: 'A product with this slug or SKU already exists.' });
    }
    console.error('Failed to update product:', error);
    return res.status(500).json({ message: 'Could not update product.' });
  }
});

router.patch('/products/:id', async (req, res) => {
  const parsed = productPatchSchema.safeParse(req.body);
  if (!parsed.success || Object.keys(parsed.data ?? {}).length === 0) {
    return res.status(400).json({ message: 'Invalid product update.' });
  }

  try {
    const product = await Product.findOneAndUpdate({ id: req.params.id }, parsed.data, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    return res.json({ product: product.toObject() });
  } catch (error) {
    console.error('Failed to patch product:', error);
    return res.status(500).json({ message: 'Could not update product.' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    return res.json({ deleted: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return res.status(500).json({ message: 'Could not delete product.' });
  }
});

export default router;
