import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import app from './config/app/app.config';
import { dataSourceOptions } from './config/database/typeorm.config';
import environmentValidation from './config/environment.validation';
import { createPinoLoggerOptions } from './core/logger/pino-logger.factory';
import { PaginationModule } from './core/pagination/pagination.module';

const env: string = process.env.NODE_ENV || 'development';

@Module({
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

    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
    }),

    PaginationModule,
  ],
})
export class AppModule {}
