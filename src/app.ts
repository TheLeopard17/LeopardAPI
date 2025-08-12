import express from 'express';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import morgan from 'morgan';
import { helmetMw, rateApi } from './middlewares/security';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/error';
import { logger } from './utils/logger';

export const app = express();
app.disable('x-powered-by');

app.use(helmetMw);

const ORIGINS = [
  "http://localhost:3000",          // dev React
  "https://desk.leopardservice.eu", // prod
];

app.use(cors({
  origin: ORIGINS,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false, // metti true SOLO se usi cookie/sessione
  maxAge: 600,        // cache preflight (facoltativo)
}));

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.use(pinoHttp({ logger }));
app.use(morgan('tiny'));

app.use('/v1', rateApi, routes);

// error handler last
app.use(errorHandler);
