import express from 'express';
import { apiRouter } from './routes/api';
import { healthRouter } from './routes/health';

export function createApp() {
  const app = express();

  app.use(express.json());

  app.use('/health', healthRouter);
  app.use('/api', apiRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: 'not_found' });
  });

  return app;
}
