import dotenv from 'dotenv';
import pino from 'pino';
import app from './app';

dotenv.config();

const logger = pino({ name: 'leopard-api' });

if (!process.env.JWT_SECRET) {
  logger.error('JWT_SECRET environment variable not set');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});