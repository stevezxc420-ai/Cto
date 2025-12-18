import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { AppError } from './error.middleware';
import { API_PROVIDERS } from '../services/validation.service';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new AppError(`Validation error: ${messages}`, 400);
      }
      next(error);
    }
  };
};

export const createCredentialSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  provider: z.enum(API_PROVIDERS as [string, ...string[]]).transform(val => val as any),
  apiKey: z.string().min(1, 'apiKey is required'),
  keyName: z.string().optional(),
});

export const userIdParamSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
});
