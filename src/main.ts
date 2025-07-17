import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { initializeApp } from './app.create';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app: INestApplication =
    await NestFactory.create<NestExpressApplication>(AppModule);

  initializeApp(app);
  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap().catch((error) => {
  console.error('Error during application bootstrap:', error);
  process.exit(1);
});
