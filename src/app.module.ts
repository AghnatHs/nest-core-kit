import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import app from './infrastructure/config/app/app.config';
import { dataSourceOptions } from './infrastructure/config/database/typeorm.config';
import environmentValidation from './infrastructure/config/environment.validation';
import { createPinoLoggerOptions } from './infrastructure/core/logger/pino-logger.factory';

@Module({
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

    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
    }),
  ],
})
export class AppModule {}
