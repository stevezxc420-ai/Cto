import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

export const apiRouter = Router();

apiRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});
