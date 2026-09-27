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

interface ApiErrorResponse {
  success: boolean;
  statusCode: number;
  error: string;
  errors?: unknown;
}

function asApiResponse<T>(body: unknown): ApiResponse<T> {
  return body as ApiResponse<T>;
}

function asApiError(body: unknown): ApiErrorResponse {
  return body as ApiErrorResponse;
}

describe('AuditLogs (e2e)', () => {
  let app: INestApplication<App>;
  let requestTestAgent: TestAgent;

  const createAuditLog = (
    payload: Record<string, unknown>,
  ): ReturnType<TestAgent['post']> =>
    requestTestAgent.post('/audit-logs').send(payload);

  const listAuditLogs = (
    query?: Record<string, string>,
  ): ReturnType<TestAgent['get']> =>
    requestTestAgent.get('/audit-logs').query(query ?? {});

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

  it('returns an empty list when there are no audit logs', async () => {
    const response = await listAuditLogs().expect(200);

    const list = asApiResponse<AuditLogBody[]>(response.body);
    expect(list.data).toEqual([]);
  });

  it('persists and returns a created audit log', async () => {
    const createResponse = await createAuditLog({
      action: 'CREATE',
      entityType: 'User',
      entityId: '42',
      actorId: '1',
      metadata: { ip: '127.0.0.1' },
    }).expect(201);

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

    const listResponse = await listAuditLogs().expect(200);
    const list = asApiResponse<AuditLogBody[]>(listResponse.body);
    expect(list.data).toHaveLength(1);
    expect(list.data[0].id).toBe(id);

    const getResponse = await requestTestAgent
      .get(`/audit-logs/${id}`)
      .expect(200);
    const found = asApiResponse<AuditLogBody>(getResponse.body);
    expect(found.data.id).toBe(id);
  });

  it('persists optional fields as null when omitted', async () => {
    const createResponse = await createAuditLog({ action: 'LOGIN' }).expect(
      201,
    );

    const created = asApiResponse<AuditLogBody>(createResponse.body);
    expect(created.data).toMatchObject({
      action: 'LOGIN',
      entityType: null,
      entityId: null,
      actorId: null,
      metadata: null,
    });
  });

  it('filters audit logs by entity type', async () => {
    await createAuditLog({ action: 'CREATE', entityType: 'User' }).expect(201);
    await createAuditLog({ action: 'CREATE', entityType: 'Order' }).expect(201);

    const response = await listAuditLogs({ entityType: 'User' }).expect(200);

    const list = asApiResponse<AuditLogBody[]>(response.body);
    expect(list.data).toHaveLength(1);
    expect(list.data[0].entityType).toBe('User');
  });

  it('filters audit logs by action', async () => {
    await createAuditLog({ action: 'LOGIN' }).expect(201);
    await createAuditLog({ action: 'LOGOUT' }).expect(201);
    await createAuditLog({ action: 'LOGIN' }).expect(201);

    const response = await listAuditLogs({ action: 'LOGIN' }).expect(200);

    const list = asApiResponse<AuditLogBody[]>(response.body);
    expect(list.data).toHaveLength(2);
    expect(list.data.every((log) => log.action === 'LOGIN')).toBe(true);
  });

  it('filters audit logs by entity id', async () => {
    await createAuditLog({ action: 'CREATE', entityId: 'user-1' }).expect(201);
    await createAuditLog({ action: 'CREATE', entityId: 'user-2' }).expect(201);

    const response = await listAuditLogs({ entityId: 'user-1' }).expect(200);

    const list = asApiResponse<AuditLogBody[]>(response.body);
    expect(list.data).toHaveLength(1);
    expect(list.data[0].entityId).toBe('user-1');
  });

  it('combines multiple filters', async () => {
    await createAuditLog({ action: 'LOGIN', entityType: 'User' }).expect(201);
    await createAuditLog({ action: 'LOGIN', entityType: 'Order' }).expect(201);
    await createAuditLog({ action: 'LOGOUT', entityType: 'User' }).expect(201);

    const response = await listAuditLogs({
      action: 'LOGIN',
      entityType: 'User',
    }).expect(200);

    const list = asApiResponse<AuditLogBody[]>(response.body);
    expect(list.data).toHaveLength(1);
    expect(list.data[0]).toMatchObject({ action: 'LOGIN', entityType: 'User' });
  });

  it('returns audit logs newest first', async () => {
    const first = await createAuditLog({ action: 'FIRST' }).expect(201);
    const second = await createAuditLog({ action: 'SECOND' }).expect(201);

    const firstId = asApiResponse<AuditLogBody>(first.body).data.id;
    const secondId = asApiResponse<AuditLogBody>(second.body).data.id;

    const response = await listAuditLogs().expect(200);
    const list = asApiResponse<AuditLogBody[]>(response.body);

    expect(list.data.map((log) => log.id)).toEqual([secondId, firstId]);
  });

  it('clears all audit logs when the database is cleared', async () => {
    await createAuditLog({ action: 'CREATE' }).expect(201);

    await clearDatabase(app);

    const response = await listAuditLogs().expect(200);
    const list = asApiResponse<AuditLogBody[]>(response.body);
    expect(list.data).toEqual([]);
  });

  it('returns 404 for an unknown audit log', async () => {
    const response = await requestTestAgent
      .get('/audit-logs/999999')
      .expect(404);

    const body = asApiError(response.body);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Audit log 999999 not found');
  });

  it('rejects an invalid payload', async () => {
    const response = await createAuditLog({}).expect(400);

    const body = asApiError(response.body);
    expect(body.success).toBe(false);
  });

  it('rejects unknown properties', async () => {
    await createAuditLog({ action: 'CREATE', unexpected: 'value' }).expect(400);
  });

  it('rejects a non-object metadata payload', async () => {
    await createAuditLog({
      action: 'CREATE',
      metadata: 'not-an-object',
    }).expect(400);
  });

  it('rejects an action longer than 100 characters', async () => {
    await createAuditLog({ action: 'a'.repeat(101) }).expect(400);
  });

  it('returns 400 for a non-numeric id', async () => {
    const response = await requestTestAgent.get('/audit-logs/abc').expect(400);

    const body = asApiError(response.body);
    expect(body.success).toBe(false);
  });
});
