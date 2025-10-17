import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { App } from 'supertest/types';
import createTestingApp from './utils/create-testing-app.utils';
import { clearDatabase, dropDatabase } from './utils/testing-database.utils';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let requestTestAgent: TestAgent;

  beforeAll(async () => {
    app = await createTestingApp();
    requestTestAgent = request(app.getHttpServer());
  });

  beforeEach(async () => {
    // none
  });

  afterAll(async () => {
    await dropDatabase();
    await app.close();
  });

  afterEach(async () => {
    await clearDatabase(app);
  });

  it('/ (GET)', () => {
    return requestTestAgent.get('/').expect(404);
  });
});
