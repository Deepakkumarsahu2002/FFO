import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { sendPasswordResetEmail, sendWelcomeEmail, buildResetLink } from '../lib/email.js';
import { User } from '../models/User.js';
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '../schemas.js';
import { env } from '../config.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? 'flowers-forever-dev-secret';
const googleClient = new OAuth2Client();

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid registration payload', errors: parsed.error.flatten() });
  }

  try {
    const existing = await User.findOne({ email: parsed.data.email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
    const user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone,
      password: hashedPassword,
      addresses: [],
    });

    const token = jwt.sign({ sub: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });

    await sendWelcomeEmail(user.email, user.name);

    return res.status(201).json({
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create account', error: String(error) });
  }
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid login payload' });
  }

  try {
    const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const validPassword = await bcrypt.compare(parsed.data.password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ sub: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: String(error) });
  }
});

router.post('/google', async (req, res) => {
  if (!env.googleClientId) {
    return res.status(503).json({ message: 'Google sign-in is not configured.' });
  }

  const parsed = z.object({ credential: z.string().min(1).max(8192) }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'A Google credential is required.' });
  }

  let googleAccount;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: parsed.data.credential,
      audience: env.googleClientId,
    });
    googleAccount = ticket.getPayload();
  } catch {
    return res.status(401).json({ message: 'Google sign-in credential is invalid or expired.' });
  }

  if (!googleAccount?.sub || !googleAccount.email || googleAccount.email_verified !== true) {
    return res.status(401).json({ message: 'Google did not provide a verified account email.' });
  }

  const email = googleAccount.email.trim().toLowerCase();

  try {
    let user = await User.findOne({ googleId: googleAccount.sub });

    if (!user) {
      user = await User.findOne({ email });

      if (user) {
        if (user.googleId && user.googleId !== googleAccount.sub) {
          return res.status(409).json({ message: 'This email is linked to a different Google account.' });
        }
        user.googleId = googleAccount.sub;
        if (googleAccount.picture) user.picture = googleAccount.picture;
        await user.save();
      } else {
        try {
          user = await User.create({
            name: googleAccount.name?.trim() || email,
            email,
            phone: '',
            googleId: googleAccount.sub,
            picture: googleAccount.picture,
            addresses: [],
          });
        } catch (error) {
          if ((error as { code?: number }).code !== 11000) throw error;
          user = await User.findOne({ $or: [{ googleId: googleAccount.sub }, { email }] });
          if (!user || (user.googleId && user.googleId !== googleAccount.sub)) {
            return res.status(409).json({ message: 'This Google account could not be linked safely.' });
          }
          user.googleId = googleAccount.sub;
          if (googleAccount.picture) user.picture = googleAccount.picture;
          await user.save();
        }
      }
    } else if (googleAccount.picture && user.picture !== googleAccount.picture) {
      user.picture = googleAccount.picture;
      await user.save();
    }

    const token = jwt.sign({ sub: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        picture: user.picture,
      },
    });
  } catch {
    return res.status(500).json({ message: 'Google sign-in could not be completed.' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid email address', errors: parsed.error.flatten() });
  }

  const email = parsed.data.email.toLowerCase();
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        message: 'If an account exists for this email, a password reset link has been sent.',
      });
    }

    const token = jwt.sign({ sub: user._id.toString(), purpose: 'password-reset' }, JWT_SECRET, {
      expiresIn: '1h',
    });

    const resetLink = buildResetLink(token);
    await sendPasswordResetEmail(user.email, user.name, resetLink);

    return res.json({
      message: 'If an account exists for this email, a password reset link has been sent.',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to process password reset request', error: String(error) });
  }
});

router.post('/reset-password', async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid reset payload', errors: parsed.error.flatten() });
  }

  try {
    const decoded = jwt.verify(parsed.data.token, JWT_SECRET) as { sub?: string; purpose?: string };

    if (!decoded.sub || decoded.purpose !== 'password-reset') {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.password = await bcrypt.hash(parsed.data.password, 10);
    await user.save();

    return res.json({ message: 'Password updated successfully.' });
  } catch {
    return res.status(400).json({ message: 'Invalid or expired reset token.' });
  }
});

export default router;
