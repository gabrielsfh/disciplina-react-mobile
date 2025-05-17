import express from 'express';
import { connectDB } from './src/config/mongoose.js';
import produtoRoutes from './src/routes/produtoRoutes.js';

export async function createApp() {
  await connectDB();
  const app = express();
  app.use(express.json());
  app.use('/api/produtos', produtoRoutes);

  // Middleware de tratamento de erros
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(400).json({ erro: err.message });
  });

  return app;
}