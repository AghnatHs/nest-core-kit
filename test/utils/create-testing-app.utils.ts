// test/test-utils.ts
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initializeApp } from 'src/app.create';
import { AppModule } from 'src/app.module';
import { App } from 'supertest/types';

/**
 * Creates and initializes a Nest application for testing purposes.
 *
 * @async
 * @returns {Promise<INestApplication<App>>} A Promise that resolves to the initialized Nest application.
 */
export default async function createTestingApp(): Promise<
  INestApplication<App>
> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  initializeApp(app);
  await app.init();

  return app;
}
