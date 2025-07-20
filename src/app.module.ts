import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import typeorm from './config/database/typeorm.config';
import environmentValidation from './config/environment.validation';

const env: string = process.env.NODE_ENV || 'development';
console.log(`Environment: ${env}`);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${env}`,
      load: [typeorm],
      validationSchema: environmentValidation,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          targets: [
            {
              target: 'pino-pretty',
              options: { colorize: true },
              level: 'info',
            },
            {
              target: 'pino/file',
              options: { destination: './logs/app.log' },
              level: 'info',
            },
          ],
        },
        customProps: (_, __) => ({
          context: `[${process.env.APP_NAME}]`,
          env: env,
        }),
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('typeorm')!,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
