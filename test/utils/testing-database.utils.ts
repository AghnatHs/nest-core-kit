import { INestApplication } from '@nestjs/common';
import { connectionSource } from 'src/config/database/typeorm.config';
import { DataSource } from 'typeorm';

const appDataSource: DataSource = connectionSource;

async function dropDatabase(): Promise<void> {
  await appDataSource.initialize();
  await appDataSource.dropDatabase();
  await appDataSource.destroy();
}

async function clearDatabase(app: INestApplication): Promise<void> {
  const dataSource: DataSource = app.get<DataSource>(DataSource);
  await dataSource.synchronize(true);
}

export { clearDatabase, dropDatabase };
