import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';

function parseBearerToken(headerValue: string | undefined): string | null {
  if (!headerValue) return null;
  const [scheme, token] = headerValue.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = parseBearerToken(req.header('authorization'));
  if (!token) {
    res.status(401).json({ error: 'missing_token' });
    return;
  }

  try {
    const verified = jwt.verify(token, env.jwtSecret) as JwtPayload | string;

    if (typeof verified === 'string') {
      req.user = { sub: verified };
      next();
      return;
    }

    const sub = verified.sub;
    if (!sub) {
      res.status(401).json({ error: 'invalid_token' });
      return;
    }

    req.user = { ...verified, sub: String(sub) };
    next();
  } catch {
    res.status(401).json({ error: 'invalid_token' });
  }
}
