import { Resend } from 'resend';
import { env } from '../config.js';

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail({ to, subject, html, text }: EmailPayload) {
  if (!resend || !env.resendApiKey) {
    console.warn(`[email] RESEND_API_KEY missing. Skipping "${subject}" to ${to}`);
    return { success: false, skipped: true };
  }

  try {
    const result = await resend.emails.send({
      from: env.emailFrom,
      replyTo: env.emailReplyTo,
      to,
      subject,
      html,
      text,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error(`[email] Failed to send "${subject}" to ${to}`, error);
    return { success: false, error };
  }
}

export function buildResetLink(token: string) {
  return `${env.clientUrl}/reset-password?token=${encodeURIComponent(token)}`;
}

export async function sendWelcomeEmail(to: string, name: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="margin-bottom: 16px; color: #7c2d12;">Welcome to Flowers Forever, ${name} 👋</h2>
      <p>Thank you for joining our floral community.</p>
      <p>Your account is ready and you can start browsing curated gifting collections, saving favorites, and placing orders in minutes.</p>
      <p style="margin-top: 24px;">
        <a href="${env.clientUrl}" style="display: inline-block; background: #7c2d12; color: white; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600;">Shop now</a>
      </p>
      <p style="margin-top: 24px; color: #4b5563;">Warm wishes,<br />The Flowers Forever team</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Welcome to Flowers Forever',
    html,
    text: `Welcome to Flowers Forever, ${name}! Your account is ready. Visit ${env.clientUrl} to start shopping.`,
  });
}

export async function sendOrderConfirmationEmail(
  to: string,
  name: string,
  order: { id: string; total: number; payment: string; items: Array<{ name: string; qty: number }> },
) {
  const itemList = order.items
    .map((item) => `<li>${item.name} × ${item.qty}</li>`)
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="margin-bottom: 16px; color: #7c2d12;">Order confirmed 🛒</h2>
      <p>Hello ${name},</p>
      <p>Your order <strong>#${order.id}</strong> has been placed successfully.</p>
      <ul>${itemList}</ul>
      <p><strong>Payment:</strong> ${order.payment}</p>
      <p><strong>Total:</strong> ₹${order.total}</p>
      <p style="margin-top: 24px; color: #4b5563;">We’ll keep you updated as your order moves to preparation and delivery.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Order confirmed #${order.id}`,
    html,
    text: `Hello ${name}, your order #${order.id} is confirmed. Total: ₹${order.total}. Payment: ${order.payment}.`,
  });
}

export async function sendPasswordResetEmail(to: string, name: string, resetLink: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="margin-bottom: 16px; color: #7c2d12;">Reset your password 🔐</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your Flowers Forever password.</p>
      <p style="margin-top: 24px;">
        <a href="${resetLink}" style="display: inline-block; background: #7c2d12; color: white; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600;">Reset password</a>
      </p>
      <p style="margin-top: 24px; color: #4b5563;">If you didn’t request this, you can safely ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Reset your Flowers Forever password',
    html,
    text: `Hello ${name}, reset your password here: ${resetLink}`,
  });
}
