import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import pinoHttp from 'pino-http';
import authRouter from './routes/auth';
import authenticateToken from './middleware/auth';

const logger = pino({ name: 'leopard-api' });

const app = express();

app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

app.use('/auth', authRouter);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Protected content' });
});

export default app;
