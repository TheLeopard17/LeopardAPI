import { Request, Response } from 'express';
import { LoginSchema } from './schema';
import Operator from '../operators/model';
import Role from '../roles/model';
import Company from '../companies/model';
import Session from './session.model';
import { verifyPin } from '../../utils/crypto';
import { signAccess, signRefresh, verifyToken } from '../../utils/jwt';
import { rid, sha256 } from '../../utils/random';
import { env } from '../../config/env';

export async function login(req: Request, res: Response) {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { operatorCode, pin } = parsed.data;

  const op: any = await Operator.findOne({ operatorCode }).lean();
  if (!op) return res.status(401).json({ error: 'Invalid credentials' });
  if (op.status !== 'verified') return res.status(403).json({ error: `Operator status: ${op.status}` });

  const ok = await verifyPin(op.pinHash, pin);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  // scope & roles map
  const roleIds = op.roles.map((r: any) => r.roleId);
  const roles = await Role.find({ _id: { $in: roleIds } }).lean();
  const scope = Array.from(new Set(roles.flatMap((r: any) => r.permissions)));

  const rolesMap: Record<string, string[]> = {};
  for (const r of op.roles) {
    const key = String(r.companyId);
    rolesMap[key] = rolesMap[key] ?? [];
    rolesMap[key].push(String(r.roleId));
  }

  // Access
  const accessToken = signAccess({ sub: String(op._id), roles: rolesMap, scope });

  // Refresh + Session persistita (rotazione futura)
  const jti = rid();
  const refreshToken = signRefresh(String(op._id), jti);
  await Session.create({
    operatorId: op._id,
    refreshId: jti,
    refreshHash: sha256(refreshToken),
    userAgent: req.headers['user-agent'],
    ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress,
    expiresAt: new Date(Date.now() + env.jwt.refreshTtlDays * 24 * 60 * 60 * 1000)
  });

  return res.json({
    accessToken, refreshToken,
    operator: { _id: op._id, name: op.name, operatorCode: op.operatorCode, status: op.status },
    companies: await Company.find({ _id: { $in: op.roles.map((r: any) => r.companyId) } }).lean()
  });
}

export async function refresh(req: Request, res: Response) {
  const hdr = req.headers.authorization;
  if (!hdr?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing bearer token' });
  const token = hdr.slice('Bearer '.length);

  let payload: any;
  try {
    payload = verifyToken(token);
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (payload.typ !== 'refresh' || !payload.jti) return res.status(400).json({ error: 'Invalid refresh token' });

  // Session valida?
  const session = await Session.findOne({ refreshId: payload.jti, operatorId: payload.sub, revokedAt: { $exists: false } });
  if (!session) return res.status(401).json({ error: 'Session not found' });
  if (session.expiresAt.getTime() < Date.now()) return res.status(401).json({ error: 'Session expired' });
  if (session.refreshHash !== sha256(token)) return res.status(401).json({ error: 'Token mismatch' });

  // Carica operator per rigenerare scope
  const op: any = await Operator.findById(payload.sub).lean();
  if (!op || op.status !== 'verified') return res.status(403).json({ error: 'Operator invalid' });

  const roles = await Role.find({ _id: { $in: op.roles.map((r: any) => r.roleId) } }).lean();
  const scope = Array.from(new Set(roles.flatMap((r: any) => r.permissions)));
  const rolesMap: Record<string, string[]> = {};
  for (const r of op.roles) {
    const key = String(r.companyId);
    rolesMap[key] = rolesMap[key] ?? [];
    rolesMap[key].push(String(r.roleId));
  }

  // Rotazione: revoca vecchia sessione e crea nuova
  session.revokedAt = new Date();
  await session.save();

  const newJti = rid();
  const newRefresh = signRefresh(String(op._id), newJti);
  await Session.create({
    operatorId: op._id,
    refreshId: newJti,
    refreshHash: sha256(newRefresh),
    userAgent: req.headers['user-agent'],
    ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress,
    expiresAt: new Date(Date.now() + env.jwt.refreshTtlDays * 24 * 60 * 60 * 1000)
  });

  const accessToken = signAccess({ sub: String(op._id), roles: rolesMap, scope });
  return res.json({ accessToken, refreshToken: newRefresh });
}

export async function logout(req: Request, res: Response) {
  // logout accetta il refresh nel bearer e lo revoca
  const hdr = req.headers.authorization;
  if (!hdr?.startsWith('Bearer ')) return res.json({ ok: true });
  const token = hdr.slice('Bearer '.length);
  try {
    const p: any = verifyToken(token);
    if (p.typ === 'refresh' && p.jti) {
      await Session.updateOne({ refreshId: p.jti }, { $set: { revokedAt: new Date() } });
    }
  } catch {}
  return res.json({ ok: true });
}