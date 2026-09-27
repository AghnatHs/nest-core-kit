import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Clears all data from the database by truncating every table.
 * Uses CASCADE so foreign keys do not block the truncate.
 *
 * @param app - The Nest application instance
 */
async function clearDatabase(app: INestApplication): Promise<void> {
  const dataSource: DataSource = app.get<DataSource>(DataSource);
  const tables: string = dataSource.entityMetadatas
    .map((entity) => `"${entity.tableName}"`)
    .join(', ');

  if (!tables) {
    return;
  }

  await dataSource.query(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`);
}

export { clearDatabase };
