import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { initializeApp } from './app';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(AppModule);

  initializeApp(app);

  await app.listen(process.env.APP_PORT ?? 3000);
}
void bootstrap();
