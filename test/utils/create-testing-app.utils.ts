import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initializeApp } from 'src/app.create';
import { AppModule } from 'src/app.module';
import { App } from 'supertest/types';

/**
 * Creates and initializes the real application for testing.
 *
 * When NODE_ENV is "test", AppModule swaps the Postgres connection for an
 * in-process PGlite database. Closing the app closes the PGlite instance,
 * giving each test file a fresh database.
 *
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
