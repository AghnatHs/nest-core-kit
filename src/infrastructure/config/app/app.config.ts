import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  environment: process.env.NODE_ENV,
  name: process.env.APP_NAME,
  port: parseInt(process.env.APP_PORT!, 10),
  url: process.env.APP_URL,
}));
