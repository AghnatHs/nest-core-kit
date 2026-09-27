import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { AuditLogsModule } from './features/audit-logs/audit-logs.module';
import app from './infrastructure/config/app/app.config';
import { createDataSourceOptions } from './infrastructure/config/database/typeorm.config';
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

    TypeOrmModule.forRootAsync({
      useFactory: createDataSourceOptions,
    }),

    AuditLogsModule,
  ],
})
export class AppModule {}
