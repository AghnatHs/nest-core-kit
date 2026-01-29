import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { initializeApp } from 'src/app.create';
import app from 'src/config/app/app.config';
import { dataSourceOptions } from 'src/config/database/typeorm.config';
import environmentValidation from 'src/config/environment.validation';
import { createPinoLoggerOptions } from 'src/core/logger/pino-logger.factory';
import { App } from 'supertest/types';

const env: string = process.env.NODE_ENV || 'test';

/**
 * Creates and initializes a Nest application for testing purposes.
 * Uses a unique database per test file for isolation.
 *
 * @async
 * @param databaseName - The name of the test database to use
 * @returns {Promise<INestApplication<App>>} A Promise that resolves to the initialized Nest application.
 */
export default async function createTestingApp(
  databaseName: string,
): Promise<INestApplication<App>> {
  const testDataSourceOptions = {
    ...dataSourceOptions,
    database: databaseName,
    autoLoadEntities: true,
    logging: false,
  } as TypeOrmModuleOptions;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: `.env.${env}`,
        load: [app],
        validationSchema: environmentValidation,
      }),

      LoggerModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (config: ConfigService) => createPinoLoggerOptions(config),
      }),

      TypeOrmModule.forRoot(testDataSourceOptions),
    ],
  }).compile();

  const app_ = moduleFixture.createNestApplication();
  initializeApp(app_);
  await app_.init();

  return app_;
}
