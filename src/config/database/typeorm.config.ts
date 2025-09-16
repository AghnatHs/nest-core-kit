import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({
  path: process.env.NODE_ENV
    ? `.env.${process.env.NODE_ENV}`
    : '.env.development',
});

export const dataSourceOptions: DataSourceOptions = {
  type: process.env.DB_TYPE as never,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: process.env.TYPEORM_LOGGING === 'true',
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
};

export const connectionSource = new DataSource(dataSourceOptions);
