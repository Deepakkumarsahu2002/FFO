import { Product } from '../models/Product.js';

export async function seedProducts() {
  const count = await Product.countDocuments();
  if (count > 0) {
    return;
  }

  console.log('Backend catalog is running without a mock seed dataset.');
}
