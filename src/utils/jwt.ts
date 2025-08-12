import jwt from 'jsonwebtoken';
import { env } from '../config/env';

type BaseClaims = { sub: string; roles: Record<string, string[]>; scope: string[]; };

export function signAccess(claims: BaseClaims) {
  return jwt.sign(claims, env.jwt.privateKey, {
    algorithm: 'RS256',
    expiresIn: `${env.jwt.accessTtlMin}m`,
    issuer: env.jwt.iss,
    audience: env.jwt.aud
  });
}

export function signRefresh(sub: string, jti: string) {
  return jwt.sign({ sub, typ: 'refresh', jti }, env.jwt.privateKey, {
    algorithm: 'RS256',
    expiresIn: `${env.jwt.refreshTtlDays}d`,
    issuer: env.jwt.iss,
    audience: env.jwt.aud
  });
}

export function verifyToken<T = any>(token: string) {
  return jwt.verify(token, env.jwt.publicKey, { algorithms: ['RS256'], issuer: env.jwt.iss, audience: env.jwt.aud }) as T;
}
