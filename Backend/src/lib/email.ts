import { Resend } from 'resend';
import { env } from '../config.js';

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailLayoutOptions {
  preheader: string;
  eyebrow: string;
  title: string;
  content: string;
  action?: { href: string; label: string };
  note?: string;
}

function escapeHtml(value: string) {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return value.replace(/[&<>"']/g, (character) => entities[character] ?? character);
}

function emailLayout({ preheader, eyebrow, title, content, action, note }: EmailLayoutOptions) {
  const appName = escapeHtml(env.appName);

  return `
    <!doctype html>
    <html lang="en">
      <body style="margin:0; padding:0; background:#f4f1ed; color:#292c29; font-family:Arial, Helvetica, sans-serif;">
        <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">${escapeHtml(preheader)}</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f1ed;">
          <tr>
            <td align="center" style="padding:32px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">
                <tr>
                  <td align="center" style="padding:0 0 20px;">
                    <span style="display:inline-block; width:34px; height:34px; border-radius:50%; background:#713449; color:#ffffff; font-size:12px; font-weight:bold; line-height:34px; text-align:center; vertical-align:middle;">FF</span>
                    <span style="padding-left:8px; color:#713449; font-family:Georgia, 'Times New Roman', serif; font-size:19px; font-weight:bold; vertical-align:middle;">${appName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="overflow:hidden; border:1px solid #e8e1da; border-radius:10px; background:#ffffff;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr><td style="height:5px; background:#52765d; font-size:0; line-height:0;">&nbsp;</td></tr>
                      <tr>
                        <td style="padding:34px 32px 30px;">
                          <p style="margin:0 0 10px; color:#52765d; font-size:11px; font-weight:bold;">${escapeHtml(eyebrow.toUpperCase())}</p>
                          <h1 style="margin:0 0 20px; color:#713449; font-family:Georgia, 'Times New Roman', serif; font-size:27px; font-weight:normal; line-height:1.25;">${escapeHtml(title)}</h1>
                          ${content}
                          ${action ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;"><tr><td align="center" style="border-radius:6px; background:#713449;"><a href="${escapeHtml(action.href)}" style="display:inline-block; padding:13px 20px; color:#ffffff; font-size:14px; font-weight:bold; text-decoration:none;">${escapeHtml(action.label)}</a></td></tr></table>` : ''}
                          ${note ? `<p style="margin:26px 0 0; padding-top:18px; border-top:1px solid #eee8e2; color:#626761; font-size:13px; line-height:1.6;">${note}</p>` : ''}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:18px 12px 0; color:#747872; font-size:12px; line-height:1.6;">
                    <p style="margin:0;">Thoughtful flowers and gifts, for every occasion.</p>
                    <p style="margin:5px 0 0;">© ${new Date().getFullYear()} ${appName}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

async function sendEmail({ to, subject, html, text }: EmailPayload) {
  if (!resend || !env.resendApiKey) {
    console.warn(`[email] RESEND_API_KEY missing. Skipping "${subject}" to ${to}`);
    return { success: false, skipped: true };
  }

  if (env.emailTestMode && !env.emailTestRecipient) {
    console.error('[email] EMAIL_TEST_MODE is enabled but EMAIL_TEST_RECIPIENT is missing. Skipping email.');
    return { success: false, skipped: true };
  }

  const recipient = env.emailTestMode ? env.emailTestRecipient : to;
  if (env.emailTestMode) {
    console.info(`[email] Test mode: redirecting "${subject}" to ${recipient}`);
  }

  try {
    const result = await resend.emails.send({
      from: env.emailFrom,
      replyTo: env.emailReplyTo,
      to: recipient,
      subject,
      html,
      text,
    });

    if (result.error) {
      console.error(`[email] Resend rejected "${subject}" to ${to}`, result.error);
      return { success: false, error: result.error };
    }

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
  const safeName = escapeHtml(name);
  const html = emailLayout({
    preheader: 'Your Flowers Forever account is ready.',
    eyebrow: 'A little something for you',
    title: `Welcome, ${safeName}`,
    content: `<p style="margin:0 0 14px; color:#414640; font-size:15px; line-height:1.7;">We’re glad you’re here. Your account is ready for browsing thoughtful flowers and gifts for the people who matter.</p><p style="margin:0; color:#414640; font-size:15px; line-height:1.7;">Save your favorites, find something lovely, and we’ll help you take it from there.</p>`,
    action: { href: env.clientUrl, label: 'Explore the collection' },
    note: 'Need help? Reply to this email and our team will be glad to help.',
  });

  return sendEmail({
    to,
    subject: `Welcome to ${env.appName}`,
    html,
    text: `Welcome, ${name}! Your ${env.appName} account is ready. Explore flowers and gifts at ${env.clientUrl}. Need help? Reply to this email.`,
  });
}

export async function sendOrderConfirmationEmail(
  to: string,
  name: string,
  order: { id: string; total: number; payment: string; items: Array<{ name: string; qty: number }> },
) {
  const safeOrderId = escapeHtml(order.id);
  const itemRows = order.items
    .map((item) => `<tr><td style="padding:11px 0; border-bottom:1px solid #eee8e2; color:#414640; font-size:14px;">${escapeHtml(item.name)}</td><td align="right" style="padding:11px 0; border-bottom:1px solid #eee8e2; color:#626761; font-size:14px; white-space:nowrap;">Qty ${item.qty}</td></tr>`)
    .join('');
  const formattedTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(order.total);
  const html = emailLayout({
    preheader: `Order #${order.id} is confirmed.`,
    eyebrow: 'Order update',
    title: 'Your order is confirmed',
    content: `<p style="margin:0 0 18px; color:#414640; font-size:15px; line-height:1.7;">Hello ${escapeHtml(name)}, thank you for choosing us. We’ve received your order and will keep you updated as it moves toward delivery.</p><p style="margin:0 0 8px; color:#292c29; font-size:13px; font-weight:bold;">ORDER NUMBER</p><p style="margin:0 0 24px; color:#713449; font-size:20px; font-weight:bold;">#${safeOrderId}</p><p style="margin:0 0 8px; color:#292c29; font-size:13px; font-weight:bold;">YOUR ITEMS</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${itemRows}</table><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:18px;"><tr><td style="padding:5px 0; color:#626761; font-size:14px;">Payment</td><td align="right" style="padding:5px 0; color:#414640; font-size:14px;">${escapeHtml(order.payment)}</td></tr><tr><td style="padding:10px 0 0; color:#292c29; font-size:15px; font-weight:bold;">Order total</td><td align="right" style="padding:10px 0 0; color:#713449; font-size:17px; font-weight:bold;">${formattedTotal}</td></tr></table>`,
    action: { href: `${env.clientUrl}/orders?track=${encodeURIComponent(order.id)}`, label: 'View your orders' },
    note: 'Keep your order number handy if you contact our support team.',
  });

  return sendEmail({
    to,
    subject: `Order confirmed #${order.id}`,
    html,
    text: `Hello ${name}, your order #${order.id} is confirmed. Items: ${order.items.map((item) => `${item.name} x ${item.qty}`).join(', ')}. Total: ${formattedTotal}. Payment: ${order.payment}. View your orders: ${env.clientUrl}/orders?track=${encodeURIComponent(order.id)}`,
  });
}

export async function sendPasswordResetEmail(to: string, name: string, resetLink: string) {
  const safeResetLink = escapeHtml(resetLink);
  const html = emailLayout({
    preheader: 'Use the secure link to reset your password.',
    eyebrow: 'Account security',
    title: 'Reset your password',
    content: `<p style="margin:0; color:#414640; font-size:15px; line-height:1.7;">Hello ${escapeHtml(name)}, we received a request to reset the password for your ${escapeHtml(env.appName)} account.</p><p style="margin:14px 0 0; color:#414640; font-size:15px; line-height:1.7;">This link expires in one hour and can only be used once. If you didn’t request a reset, you can safely ignore this message.</p><p style="margin:22px 0 0; color:#747872; font-size:12px; line-height:1.6;">If the button doesn’t work, paste this link into your browser:<br /><a href="${safeResetLink}" style="color:#713449; word-break:break-all;">${safeResetLink}</a></p>`,
    action: { href: resetLink, label: 'Choose a new password' },
    note: 'For your security, never share this link with anyone.',
  });

  return sendEmail({
    to,
    subject: `Reset your ${env.appName} password`,
    html,
    text: `Hello ${name}, use this link to reset your ${env.appName} password within one hour: ${resetLink}. If you didn’t request this, ignore this email.`,
  });
}
