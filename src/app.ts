import express from 'express';
import { apiRouter } from './routes/api';
import { healthRouter } from './routes/health';
import credentialsRoutes from './routes/credentials.routes';
import { errorHandler } from './middleware/error.middleware';

// Note: JS routes from PR #2 could be added here too if needed
// const authRoutes = require('./routes/auth');

export function createApp() {
  const app = express();

  app.use(express.json());

  app.use('/health', healthRouter);
  app.use('/api', apiRouter);
  app.use('/api/credentials', credentialsRoutes);

  // Error handler should be last
  app.use(errorHandler);

  app.use((_req, res) => {
    res.status(404).json({ error: 'not_found' });
  });

  return app;
}
