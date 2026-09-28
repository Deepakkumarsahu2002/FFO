import express from 'express';
import cors from 'cors';
import { env } from './config.js';
import catalogRoutes from './routes/catalog.routes.js';
import authRoutes from './routes/auth.routes.js';
import accountRoutes from './routes/account.routes.js';
import ordersRoutes, { handleRazorpayWebhook } from './routes/orders.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

function isAllowedOrigin(origin: string) {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = origin.replace(/\/$/, '');

  if (env.allowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  try {
    const url = new URL(origin);
    const isLocalHost = ['localhost', '127.0.0.1'].includes(url.hostname);
    return (url.protocol === 'http:' || url.protocol === 'https:') && isLocalHost;
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin: (origin, callback) => callback(null, !origin || isAllowedOrigin(origin)),
    credentials: true,
  }),
);
app.post('/api/webhooks/razorpay', express.raw({ type: 'application/json' }), handleRazorpayWebhook);
app.use(express.json({ limit: '12mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Flowers Forever API is running' });
});

app.use('/api', catalogRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api', ordersRoutes);
app.use('/api/admin', adminRoutes);

export default app;
