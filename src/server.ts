import dotenv from 'dotenv';
import pino from 'pino';
import app from './app';

dotenv.config();

const logger = pino({ name: 'leopard-api' });
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
