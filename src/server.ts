import { app } from './app';
import { env } from './config/env';
import { connectMongo } from './db/mongo';

(async () => {
  await connectMongo();
  app.listen(env.port, () => {
    console.log(`Leopard API listening on :${env.port}`);
  });
})();
