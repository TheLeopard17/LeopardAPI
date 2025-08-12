import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

export function requireCompany(req: Request, res: Response, next: NextFunction) {
  const companyId = (req.query.companyId || req.headers['x-company-id']) as string | undefined;
  if (!companyId || !Types.ObjectId.isValid(companyId)) {
    return res.status(400).json({ error: 'companyId required' });
  }
  // Verifica che l'utente abbia RUOLI su questa company (dentro il JWT)
  const rolesMap = req.user?.roles || {};
  const hasAccess = Object.prototype.hasOwnProperty.call(rolesMap, companyId);
  if (!hasAccess) return res.status(403).json({ error: 'No access to this company' });
  (req as any).companyId = companyId;
  next();
}
