import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const productSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    rating: { type: Number, required: true },
    reviews: { type: Number, required: true },
    stock: { type: Number, required: true },
    sku: { type: String, required: true },
    images: [{ type: String, required: true }],
    tags: [{ type: String }],
    color: { type: String, required: true },
    flowerType: { type: String },
    sameDay: { type: Boolean, default: true },
    isBestSeller: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    care: { type: String },
    contains: [{ type: String }],
  },
  {
    timestamps: true,
  },
);

export type ProductDocument = InferSchemaType<typeof productSchema>;

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
