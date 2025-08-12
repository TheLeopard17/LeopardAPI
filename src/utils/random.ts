import crypto from 'crypto';
export const rid = () => crypto.randomBytes(16).toString('hex');
export const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');
