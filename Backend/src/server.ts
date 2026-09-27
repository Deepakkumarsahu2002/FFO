import app from './app.js';
import { env } from './config.js';
import { connectDB } from './db.js';

async function startServer() {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`Flowers Forever API listening on http://localhost:${env.port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
