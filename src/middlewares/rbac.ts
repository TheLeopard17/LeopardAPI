import { Request, Response, NextFunction } from 'express';

export function rbac(required: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const scope = req.user?.scope ?? [];
    const ok = required.every(r => scope.includes(r) || scope.includes('*'));
    if (!ok) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
