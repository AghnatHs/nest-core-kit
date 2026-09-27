import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { App } from 'supertest/types';
import createTestingApp from './utils/create-testing-app.utils';
import { clearDatabase } from './utils/testing-database.utils';

interface AuditLogBody {
  id: number;
  action: string;
  entityType: string | null;
  entityId: string | null;
  actorId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

function asApiResponse<T>(body: unknown): ApiResponse<T> {
  return body as ApiResponse<T>;
}

describe('AuditLogs (e2e)', () => {
  let app: INestApplication<App>;
  let requestTestAgent: TestAgent;

  beforeAll(async () => {
    app = await createTestingApp();
    requestTestAgent = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await clearDatabase(app);
  });

  it('persists and returns a created audit log', async () => {
    const createResponse = await requestTestAgent
      .post('/audit-logs')
      .send({
        action: 'CREATE',
        entityType: 'User',
        entityId: '42',
        actorId: '1',
        metadata: { ip: '127.0.0.1' },
      })
      .expect(201);

    const created = asApiResponse<AuditLogBody>(createResponse.body);
    expect(created.success).toBe(true);
    expect(created.data).toMatchObject({
      action: 'CREATE',
      entityType: 'User',
      entityId: '42',
      actorId: '1',
      metadata: { ip: '127.0.0.1' },
    });

    const id: number = created.data.id;
    expect(id).toBeDefined();

    const listResponse = await requestTestAgent.get('/audit-logs').expect(200);
    const list = asApiResponse<AuditLogBody[]>(listResponse.body);
    expect(list.data).toHaveLength(1);
    expect(list.data[0].id).toBe(id);

    const getResponse = await requestTestAgent
      .get(`/audit-logs/${id}`)
      .expect(200);
    const found = asApiResponse<AuditLogBody>(getResponse.body);
    expect(found.data.id).toBe(id);
  });

  it('filters audit logs by entity type', async () => {
    await requestTestAgent
      .post('/audit-logs')
      .send({ action: 'CREATE', entityType: 'User' })
      .expect(201);
    await requestTestAgent
      .post('/audit-logs')
      .send({ action: 'CREATE', entityType: 'Order' })
      .expect(201);

    const response = await requestTestAgent
      .get('/audit-logs')
      .query({ entityType: 'User' })
      .expect(200);

    const list = asApiResponse<AuditLogBody[]>(response.body);
    expect(list.data).toHaveLength(1);
    expect(list.data[0].entityType).toBe('User');
  });

  it('returns 404 for an unknown audit log', async () => {
    await requestTestAgent.get('/audit-logs/999999').expect(404);
  });

  it('rejects an invalid payload', async () => {
    const response = await requestTestAgent
      .post('/audit-logs')
      .send({})
      .expect(400);

    const body = asApiResponse<null>(response.body);
    expect(body.success).toBe(false);
  });
});
