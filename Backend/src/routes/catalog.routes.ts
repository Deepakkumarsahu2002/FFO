import { Router } from 'express';
import { Product } from '../models/Product.js';

const router = Router();

router.get('/categories', (_req, res) => {
  res.json({ items: [] });
});

router.get('/products', async (req, res) => {
  const category = req.query.category as string | undefined;
  const search = (req.query.search as string | undefined)?.trim().toLowerCase();
  const featured = req.query.featured === 'true';

  try {
    const query: Record<string, unknown> = {};
    if (category) query.category = category;
    if (featured) query.isFeatured = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { subcategory: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query).lean();
    return res.json({ items: products, total: products.length });
  } catch (error) {
    console.error('Failed to fetch products from database:', error);
    return res.status(500).json({ message: 'Unable to load products from the backend.' });
  }
});

router.get('/products/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).lean();
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json({ item: product });
  } catch (error) {
    console.error('Failed to fetch product by slug:', error);
    return res.status(500).json({ message: 'Unable to load product from the backend.' });
  }
});

router.get('/search', async (req, res) => {
  const q = (req.query.q as string | undefined)?.trim();
  if (!q) {
    return res.json({ items: [] });
  }

  try {
    const items = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { subcategory: { $regex: q, $options: 'i' } },
      ],
    }).lean();
    return res.json({ items });
  } catch (error) {
    console.error('Failed to search products:', error);
    return res.status(500).json({ message: 'Unable to search products.' });
  }
});

router.get('/coupons', (_req, res) => {
  return res.json({ items: [] });
});

router.get('/pincode/:code', (req, res) => {
  const pincode = req.params.code;
  if (!/^[1-8]\d{5}$/.test(pincode)) {
    return res.status(400).json({
      available: false,
      message: 'Enter a valid six-digit Indian PIN code.',
    });
  }

  const isBengaluru = pincode.startsWith('560');
  return res.json({
    available: true,
    pincode,
    city: isBengaluru ? 'Bengaluru' : 'India',
    sameDay: isBengaluru,
    nextDay: isBengaluru,
    estimate: isBengaluru
      ? 'Same-day or next-day delivery, depending on order time and slot availability.'
      : 'Delivery available across India. Estimated delivery is 2–5 days.',
  });
});

export default router;
