import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

// Only load from .env file if not running in a container (where env vars are injected directly)
if (!process.env.DB_HOST) {
  dotenvConfig({
    path: process.env.NODE_ENV
      ? `.env.${process.env.NODE_ENV}`
      : '.env.development',
  });
}

const isTestEnvironment: boolean = process.env.NODE_ENV === 'test';

export const dataSourceOptions: DataSourceOptions = {
  type: process.env.DB_TYPE as never,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: isTestEnvironment ? true : false,
  logging: process.env.TYPEORM_LOGGING === 'true',
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
};

export const connectionSource = new DataSource(dataSourceOptions);
