import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 4000),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  mongodbUri: process.env.MONGODB_URI ?? '',
  cloudinaryUrl: process.env.CLOUDINARY_URL ?? '',
  adminPasscode:
    process.env.ADMIN_PASSCODE ?? (process.env.NODE_ENV === 'production' ? '' : 'ffo@2026'),
  jwtSecret: process.env.JWT_SECRET ?? 'flowers-forever-dev-secret',
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  emailFrom: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
  emailReplyTo: process.env.EMAIL_REPLY_TO ?? 'flowersforeverofficial@gmail.com',
  appName: process.env.APP_NAME ?? 'Flowers Forever',
};
