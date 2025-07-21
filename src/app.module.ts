import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import app from './config/app/app.config';
import typeorm from './config/database/typeorm.config';
import environmentValidation from './config/environment.validation';
import { createPinoLoggerOptions } from './core/logger/pino-logger.factory';

const env: string = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${env}`,
      load: [typeorm, app],
      validationSchema: environmentValidation,
    }),

    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => createPinoLoggerOptions(config),
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => config.get('typeorm')!,
    }),
  ],
})
export class AppModule {}
