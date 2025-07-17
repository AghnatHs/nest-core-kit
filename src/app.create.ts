import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Express } from 'express';
import { Logger } from 'nestjs-pino';
import { AllExceptionsFilter } from './core/http/filters/http-exception.filter';
import { SuccessResponseInterceptor } from './core/http/interceptors/success-response.interceptor';

/**
 * Configures the NestJS application with global settings and middleware.
 * @param app - The NestJS application instance to configure.
 */
export function initializeApp(app: INestApplication): void {
  const expressInstance: Express = app
    .getHttpAdapter()
    .getInstance() as Express;

  expressInstance.disable('x-powered-by');

  app.useLogger(app.get(Logger));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter(app.get<Logger>(Logger)));

  app.useGlobalInterceptors(new SuccessResponseInterceptor());

  app.enableCors();
}
