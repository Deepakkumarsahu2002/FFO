import mongoose, { Schema, type InferSchemaType } from 'mongoose';

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

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    phone: { type: String, default: '' },
    googleId: { type: String, unique: true, sparse: true },
    picture: { type: String },
    addresses: [addressSchema],
  },
  {
    timestamps: true,
  },
);

export type UserDocument = InferSchemaType<typeof userSchema>;

export const User = mongoose.models.User || mongoose.model('User', userSchema);
