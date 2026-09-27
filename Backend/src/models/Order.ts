import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const orderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const addressSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    id: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    address: { type: addressSchema, required: true },
    payment: { type: String, default: 'UPI' },
    totals: {
      subtotal: Number,
      discount: Number,
      delivery: Number,
      tax: Number,
      total: Number,
    },
    total: { type: Number, required: true },
    placedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Placed', 'Preparing', 'Out for delivery', 'Delivered', 'Cancelled'],
      default: 'Placed',
    },
  },
  { timestamps: true },
);

export type OrderDocument = InferSchemaType<typeof orderSchema>;

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
