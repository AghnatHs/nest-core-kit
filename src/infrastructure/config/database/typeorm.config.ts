import { DataSource, DataSourceOptions } from 'typeorm';
import { loadEnv } from '../env';

loadEnv();

const isTestEnvironment: boolean = process.env.NODE_ENV === 'test';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: isTestEnvironment,
  logging: isTestEnvironment ? false : process.env.TYPEORM_LOGGING === 'true',
  entities: [__dirname + '/../../../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../../migrations/*{.ts,.js}'],
};

export const connectionSource = new DataSource(dataSourceOptions);
