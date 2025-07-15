import { INestApplication, ValidationPipe } from '@nestjs/common';

/**
 * Configures the NestJS application with global settings and middleware.
 * @param app - The NestJS application instance to configure.
 */
export function initializeApp(app: INestApplication): void {
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

  app.enableCors();
}
