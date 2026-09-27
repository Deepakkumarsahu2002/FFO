import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10).max(10),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(6),
});

export const addressSchema = z.object({
  label: z.string().min(2),
  name: z.string().min(2),
  phone: z.string().min(10).max(10),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().length(6),
});

export const orderSchema = z.object({
  userId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      slug: z.string(),
      name: z.string(),
      image: z.string(),
      price: z.number(),
      mrp: z.number(),
      qty: z.number().min(1),
    }),
  ),
  address: addressSchema,
  payment: z.string().default('UPI'),
  totals: z.object({
    subtotal: z.number(),
    discount: z.number(),
    delivery: z.number(),
    tax: z.number(),
    total: z.number(),
  }),
});

export const statusSchema = z.enum(['Placed', 'Preparing', 'Out for delivery', 'Delivered', 'Cancelled']);
