import 'dotenv/config';

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'https://flowersforever.pages.dev',
];

const configuredOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

export const env = {
  port: Number(process.env.PORT ?? 4000),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  allowedOrigins: [...new Set([...configuredOrigins, process.env.CLIENT_URL ?? '', ...defaultAllowedOrigins].filter(Boolean))],
  mongodbUri: process.env.MONGODB_URI ?? '',
  cloudinaryUrl: process.env.CLOUDINARY_URL ?? '',
  adminPasscode:
    process.env.ADMIN_PASSCODE ?? (process.env.NODE_ENV === 'production' ? '' : 'ffo@2026'),
  jwtSecret: process.env.JWT_SECRET ?? 'flowers-forever-dev-secret',
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? '',
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  emailFrom: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
  emailTestMode: process.env.EMAIL_TEST_MODE === 'true',
  emailTestRecipient: process.env.EMAIL_TEST_RECIPIENT ?? '',
  emailReplyTo: process.env.EMAIL_REPLY_TO ?? 'flowersforeverofficial@gmail.com',
  appName: process.env.APP_NAME ?? 'Flowers Forever',
};
