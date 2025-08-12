import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export type JwtClaims = {
  sub: string;
  roles: Record<string, string[]>; // companyId -> [roleIds]
  scope: string[];
  iat: number; exp: number; iss: string; aud: string;
};

declare global {
  namespace Express {
    interface Request { user?: JwtClaims }
  }
}

export function auth(req: Request, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization;
  if (!hdr?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing bearer token' });
  try {
    const token = hdr.slice('Bearer '.length);
    req.user = verifyToken<JwtClaims>(token);
    next();
  } catch (e: any) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
