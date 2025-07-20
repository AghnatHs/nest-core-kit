import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';
import { initializeApp } from './app.create';
import { AppModule } from './app.module';

let logger: Logger;

async function bootstrap(): Promise<void> {
  const app: INestApplication =
    await NestFactory.create<NestExpressApplication>(AppModule);

  initializeApp(app);

  logger = app.get<Logger>(Logger);

  logger.log(
    `Starting application in ${process.env.NODE_ENV} mode at ${process.env.APP_URL}`,
  );

  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap().catch((error) => {
  logger.error('Error during application bootstrap:', error);
  process.exit(1);
});
