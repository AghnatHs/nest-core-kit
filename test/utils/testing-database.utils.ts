import { INestApplication } from '@nestjs/common';
import { config as dotenvConfig } from 'dotenv';
import { dataSourceOptions } from 'src/config/database/typeorm.config';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: `.env.${process.env.NODE_ENV || 'test'}` });

/**
 * Creates admin connection options for database management operations.
 * These options exclude database, entities, and migrations to allow
 * connecting without specifying a database.
 */
function createAdminConnectionOptions(): DataSourceOptions {
  return {
    type: process.env.DB_TYPE as never,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  } as DataSourceOptions;
}

/**
 * Generates a unique database name based on the test file path and Jest worker ID.
 *
 * @returns A unique database name for the test file based on Jest worker ID
 */
function generateTestDatabaseName(): string {
  const JEST_WORKER_ID: string = process.env.JEST_WORKER_ID || '1';
  const baseDbName: string = process.env.DB_DATABASE || 'test_db';
  const randomSuffix: string = Math.random().toString(36).substring(2, 8); // just to ensure uniqueness
  const dbName: string = `${baseDbName}_${JEST_WORKER_ID}_${randomSuffix}`;
  return dbName;
}

/**
 * Creates a new DataSource for the test database.
 *
 * @param databaseName - The name of the test database
 * @returns A new DataSource configured for the test database
 */
function createTestDataSource(databaseName: string): DataSource {
  return new DataSource({
    ...dataSourceOptions,
    database: databaseName,
  } as DataSourceOptions);
}

/**
 * Creates and initializes the test database.
 * This should be called in beforeAll of each test file.
 *
 * @param databaseName - The name of the test database to create
 */
async function createTestDatabase(databaseName: string): Promise<void> {
  const adminDataSource = new DataSource(createAdminConnectionOptions());

  await adminDataSource.initialize();
  await adminDataSource.query(
    `CREATE DATABASE IF NOT EXISTS \`${databaseName}\``,
  );
  await adminDataSource.destroy();
}

/**
 * Drops the test database after tests complete.
 * This should be called in afterAll of each test file.
 *
 * @param databaseName - The name of the test database to drop
 */
async function dropTestDatabase(databaseName: string): Promise<void> {
  // connect without specifying database
  const adminDataSource = new DataSource(createAdminConnectionOptions());

  await adminDataSource.initialize();
  await adminDataSource.query(`DROP DATABASE IF EXISTS \`${databaseName}\``);
  await adminDataSource.destroy();
}

/**
 * Clears all data from the database by truncating all tables.
 *
 * @param app - The Nest application instance
 */
async function clearDatabase(app: INestApplication): Promise<void> {
  const dataSource: DataSource = app.get<DataSource>(DataSource);
  const entities = dataSource.entityMetadatas;

  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0;');

  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);
    await repository.query(`TRUNCATE TABLE \`${entity.tableName}\`;`);
  }

  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');
}

export {
  clearDatabase,
  createTestDatabase,
  createTestDataSource,
  dropTestDatabase,
  generateTestDatabaseName,
};
