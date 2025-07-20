import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomingMessage, ServerResponse } from 'http';
import { LoggerModule } from 'nestjs-pino';
import app from './config/app/app.config';
import typeorm from './config/database/typeorm.config';
import environmentValidation from './config/environment.validation';

const env: string = process.env.NODE_ENV || 'development';

const logLevel: string = env === 'production' ? 'info' : 'debug';

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
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: 'trace',
          customLogLevel: function (
            _,
            res: ServerResponse<IncomingMessage>,
            err: Error | undefined,
          ) {
            if (res.statusCode >= 400 && res.statusCode < 500) {
              return 'warn';
            } else if (res.statusCode >= 500 || err) {
              return 'error';
            } else if (res.statusCode >= 300 && res.statusCode < 400) {
              return 'silent';
            }
            return 'info';
          },
          customSuccessMessage: function (
            req: IncomingMessage,
            res: ServerResponse<IncomingMessage>,
          ) {
            if (res.statusCode === 404) {
              return 'resource not found';
            }
            return `${req.method} ${req.url} completed`;
          },
          transport: {
            targets: [
              {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                },
                level: logLevel,
              },
              {
                target: 'pino/file',
                options: {
                  destination: './logs/app.log',
                },
                level: logLevel,
              },
            ],
          },
          customProps: () => ({
            context: `[${config.get<string>('APP_NAME')}]`,
            env,
          }),
        },
      }),
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => config.get('typeorm')!,
    }),
  ],
})
export class AppModule {}
