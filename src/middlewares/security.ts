import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

export const helmetMw = helmet();
export const corsMw = cors({ origin: env.corsOrigins, credentials: true });
export const rateLogin = rateLimit({ windowMs: 60_000, limit: 5 });
export const rateApi = rateLimit({ windowMs: 60_000, limit: 120 });
