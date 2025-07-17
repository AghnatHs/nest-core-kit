import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, map } from 'rxjs';
import { DataResponse, HTTPResponse, MessageResponse } from '../http-response';

@Injectable()
export class SuccessResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<HTTPResponse> {
    const httpCtx = context.switchToHttp();
    const res = httpCtx.getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        const statusCode = res.statusCode ?? 200;

        if (data instanceof MessageResponse || data instanceof DataResponse) {
          return data;
        }

        if (typeof data === 'string') {
          return new MessageResponse(statusCode, data);
        }

        return new MessageResponse(statusCode, 'Success');
      }),
    );
  }
}
