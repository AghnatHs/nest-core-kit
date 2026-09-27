import { TypeOrmModuleOptions } from '@nestjs/typeorm';
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

/**
 * Builds the options used by AppModule. In the test environment it swaps the
 * Postgres connection for an in-process PGlite database
 */
export async function createDataSourceOptions(): Promise<TypeOrmModuleOptions> {
  if (!isTestEnvironment) {
    return {
      ...dataSourceOptions,
      autoLoadEntities: true,
    };
  }

  const { PGliteDriver } = await import('typeorm-pglite');

  return {
    ...dataSourceOptions,
    autoLoadEntities: true,
    driver: new PGliteDriver({}).driver,
  };
}
