import 'dotenv/config';

function required(name: string, v: string | undefined) {
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const env = {
  port: Number(process.env.PORT ?? 8080),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongoUri: required('MONGO_URI', process.env.MONGO_URI),
  jwt: {
    iss: required('JWT_ISS', process.env.JWT_ISS),
    aud: required('JWT_AUD', process.env.JWT_AUD),
    accessTtlMin: Number(process.env.ACCESS_TTL_MIN ?? 20),
    refreshTtlDays: Number(process.env.REFRESH_TTL_DAYS ?? 30),
    privateKey: Buffer.from(required('JWT_PRIVATE_KEY_BASE64', process.env.JWT_PRIVATE_KEY_BASE64), 'base64').toString('utf8'),
    publicKey: Buffer.from(required('JWT_PUBLIC_KEY_BASE64', process.env.JWT_PUBLIC_KEY_BASE64), 'base64').toString('utf8'),
  },
  corsOrigins: (process.env.CORS_ORIGINS ?? '').split(',').map(s => s.trim()).filter(Boolean),
  plesk: {
    baseUrl: required('PLESK_BASE_URL', process.env.PLESK_BASE_URL),
    username: required('PLESK_USERNAME', process.env.PLESK_USERNAME),
    password: required('PLESK_PASSWORD', process.env.PLESK_PASSWORD),
  }
};
