import { Router } from 'express';
import authRoutes from '../modules/auth/routes';
import webspaceHostingRoutes from '../modules/webspace/hosting/routes';
import docsRoutes from './docs';

const r = Router();
r.use('/auth', authRoutes);
r.use('/webspace/hosting', webspaceHostingRoutes);
r.use('/', docsRoutes);
r.get('/health', (_req, res) => res.json({ ok: true }));

import { auth } from '../middlewares/auth';
import Operator from '../modules/operators/model';
import Company from '../modules/companies/model';

r.get('/me', auth, async (req, res) => {
  const op = await Operator.findById(req.user!.sub).lean();
  if (!op) return res.status(404).json({ error: 'Not found' });
  const companies = await Company.find({ _id: { $in: op.roles.map((r: any) => r.companyId) } }).lean();
  res.json({
    operator: { _id: op._id, name: op.name, operatorCode: op.operatorCode, status: op.status },
    companies,
    scope: req.user!.scope
  });
});

export default r;