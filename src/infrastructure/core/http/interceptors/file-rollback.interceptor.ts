import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import * as fs from 'fs';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Interceptor to automatically delete uploaded files if an error occurs during request processing.
 * It checks for uploaded files in the request and attempts to delete them if an error is thrown.
 *
 * Place this interceptor after Multer interceptors so uploaded files can be collected from the request.
 *
 * @example
 * ```typescript
 * import { UseInterceptors } from '@nestjs/common';
 * import { FileInterceptor } from '@nestjs/platform-express';
 * import { FileRollbackInterceptor } from 'src/infrastructure/core/http/interceptors/file-rollback.interceptor';
 *
 * @UseInterceptors(
 *   FileInterceptor('image', masterProductStorage),
 *   FileRollbackInterceptor,
 * )
 * uploadSingleImage() {}
 * ```
 *
 * @example
 * ```typescript
 * import { UseInterceptors } from '@nestjs/common';
 * import { FilesInterceptor } from '@nestjs/platform-express';
 * import { FileRollbackInterceptor } from 'src/infrastructure/core/http/interceptors/file-rollback.interceptor';
 *
 * @UseInterceptors(
 *   FilesInterceptor('images', 10, masterProductStorage),
 *   FileRollbackInterceptor,
 * )
 * uploadManyImages() {}
 * ```
 *
 * @example
 * ```typescript
 * import { UseInterceptors } from '@nestjs/common';
 * import { FileFieldsInterceptor } from '@nestjs/platform-express';
 * import { FileRollbackInterceptor } from 'src/infrastructure/core/http/interceptors/file-rollback.interceptor';
 *
 * @UseInterceptors(
 *   FileFieldsInterceptor(
 *     [
 *       { name: 'thumbnail', maxCount: 1 },
 *       { name: 'gallery', maxCount: 5 },
 *     ],
 *     masterProductStorage,
 *   ),
 *   FileRollbackInterceptor,
 * )
 * uploadProductAssets() {}
 * ```
 */
@Injectable()
export class FileRollbackInterceptor implements NestInterceptor {
  private readonly logger = new Logger(FileRollbackInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((err: unknown) => {
        const req = context.switchToHttp().getRequest<Request>();
        const files = this.getAllFiles(req);

        if (files.length > 0) {
          this.logger.warn(
            `Error detected during request processing. Rolling back ${files.length} uploaded files.`,
          );
          this.deleteFiles(files);
        }

        return throwError(() => err);
      }),
    );
  }

  private getAllFiles(req: Request): Express.Multer.File[] {
    const request = req as {
      file?: Express.Multer.File;
      files?: Express.Multer.File[] | Record<string, Express.Multer.File[]>;
    };

    if (request.file) {
      return [request.file];
    }

    if (request.files) {
      if (Array.isArray(request.files)) {
        return request.files;
      }
      return Object.values(request.files).flat();
    }

    return [];
  }

  private deleteFiles(files: Express.Multer.File[]): void {
    files.forEach((file) => {
      try {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        this.logger.error(
          `Failed to delete file at ${file.path}: ${errorMessage}`,
        );
      }
    });
  }
}
