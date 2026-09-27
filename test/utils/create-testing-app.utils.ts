import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { initializeApp } from 'src/app.create';
import app from 'src/infrastructure/config/app/app.config';
import { dataSourceOptions } from 'src/infrastructure/config/database/typeorm.config';
import environmentValidation from 'src/infrastructure/config/environment.validation';
import { createPinoLoggerOptions } from 'src/infrastructure/core/logger/pino-logger.factory';
import { App } from 'supertest/types';
import { PGliteDriver } from 'typeorm-pglite';

/**
 * Creates and initializes a Nest application for testing purposes.
 * Uses an in-process PGlite database, so no database server is required.
 * Closing the app closes the PGlite instance, giving each test file a fresh database.
 *
 * @returns {Promise<INestApplication<App>>} A Promise that resolves to the initialized Nest application.
 */
export default async function createTestingApp(): Promise<
  INestApplication<App>
> {
  const testDataSourceOptions = {
    ...dataSourceOptions,
    driver: new PGliteDriver({}).driver,
    autoLoadEntities: true,
    synchronize: true,
    logging: false,
  } as TypeOrmModuleOptions;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
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
