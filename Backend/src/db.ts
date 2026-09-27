import mongoose from 'mongoose';
import { env } from './config.js';

export async function connectDB() {
  if (!env.mongodbUri) {
    console.warn('MONGODB_URI is not set. API will run without database connectivity.');
    return;
  }

  try {
    await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
  }
}
