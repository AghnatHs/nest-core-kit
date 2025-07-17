import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { isArray } from 'class-validator';
import { Response } from 'express';
import { Logger } from 'nestjs-pino';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number;
    let message: string = 'Internal server error';
    let errors: unknown[] | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if ('message' in body) {
        if (typeof body.message === 'string') {
          message = body.message;
        } else if (isArray(body.message) && body.message.length > 0) {
          message = body.message[0] as string;
          errors = body.message;
        }
      }
      if (exception instanceof InternalServerErrorException) {
        this.logger.error(exception.message, exception.stack);
      }

      response.status(status).json({
        success: false,
        statusCode: status,
        error: message,
        errors: errors,
      });
    } else {
      status = 500;
      if (exception instanceof Error) {
        message = exception.message;
        this.logger.error(exception.message, exception.stack);
      } else {
        this.logger.error('Unknown error occurred', exception);
      }

      response.status(status).json({
        success: false,
        statusCode: status,
        error: message,
        errors: undefined,
      });
    }
  }
}
