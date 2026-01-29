import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import createTestingApp from './utils/create-testing-app.utils';
import {
  clearDatabase,
  createTestDatabase,
  dropTestDatabase,
  generateTestDatabaseName,
} from './utils/testing-database.utils';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let requestTestAgent: TestAgent;
  let dataSource: DataSource;
  const databaseName: string = generateTestDatabaseName(); // database name for this test file only

  beforeAll(async () => {
    await createTestDatabase(databaseName);
    app = await createTestingApp(databaseName);
    dataSource = app.get<DataSource>(DataSource);
    requestTestAgent = request(app.getHttpServer());
  });

  beforeEach(async () => {
    // none
  });

  afterAll(async () => {
    await app.close();
    await dropTestDatabase(databaseName);
  });

  afterEach(async () => {
    await clearDatabase(app);
  });

  it('/ (GET)', () => {
    return requestTestAgent.get('/').expect(404);
  });
});
