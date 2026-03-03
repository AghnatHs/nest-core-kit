import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import * as fs from 'fs';
import { lastValueFrom, of, throwError } from 'rxjs';
import { FileRollbackInterceptor } from './file-rollback.interceptor';

describe('FileRollbackInterceptor', () => {
  let interceptor: FileRollbackInterceptor;
  let context: ExecutionContext;
  let callHandler: CallHandler;

  beforeEach(() => {
    jest.restoreAllMocks();

    interceptor = new FileRollbackInterceptor();
    const logger = (
      interceptor as unknown as {
        logger: {
          warn: (message: string) => void;
          error: (message: string) => void;
        };
      }
    ).logger;

    jest.spyOn(logger, 'warn').mockImplementation();
    jest.spyOn(logger, 'error').mockImplementation();

    context = {
      switchToHttp: () => ({
        getRequest: () => ({}) as Request,
      }),
    } as ExecutionContext;

    callHandler = {
      handle: jest.fn(),
    };
  });

  it('must pass through successful response without deleting files', async () => {
    const existsSpy = jest.spyOn(fs, 'existsSync');
    const unlinkSpy = jest.spyOn(fs, 'unlinkSync');

    (callHandler.handle as jest.Mock).mockReturnValue(of('ok'));

    await expect(
      lastValueFrom(interceptor.intercept(context, callHandler)),
    ).resolves.toBe('ok');

    expect(existsSpy).not.toHaveBeenCalled();
    expect(unlinkSpy).not.toHaveBeenCalled();
  });

  it('must rollback single uploaded file and rethrow error', async () => {
    const filePath = '/tmp/upload-1.png';
    const error = new Error('request failed');

    context = {
      switchToHttp: () => ({
        getRequest: () =>
          ({
            file: { path: filePath },
          }) as Request,
      }),
    } as ExecutionContext;

    const existsSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    const unlinkSpy = jest.spyOn(fs, 'unlinkSync').mockImplementation();
    const logger = (
      interceptor as unknown as {
        logger: { warn: jest.Mock };
      }
    ).logger;

    (callHandler.handle as jest.Mock).mockReturnValue(throwError(() => error));

    await expect(
      lastValueFrom(interceptor.intercept(context, callHandler)),
    ).rejects.toBe(error);

    expect(logger.warn).toHaveBeenCalledWith(
      'Error detected during request processing. Rolling back 1 uploaded files.',
    );
    expect(existsSpy).toHaveBeenCalledWith(filePath);
    expect(unlinkSpy).toHaveBeenCalledWith(filePath);
  });

  it('must rollback files from request.files array', async () => {
    const fileA = '/tmp/upload-a.png';
    const fileB = '/tmp/upload-b.png';
    const error = new Error('array upload failed');

    context = {
      switchToHttp: () => ({
        getRequest: () =>
          ({
            files: [{ path: fileA }, { path: fileB }],
          }) as Request,
      }),
    } as ExecutionContext;

    const existsSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    const unlinkSpy = jest.spyOn(fs, 'unlinkSync').mockImplementation();

    (callHandler.handle as jest.Mock).mockReturnValue(throwError(() => error));

    await expect(
      lastValueFrom(interceptor.intercept(context, callHandler)),
    ).rejects.toBe(error);

    expect(existsSpy).toHaveBeenNthCalledWith(1, fileA);
    expect(existsSpy).toHaveBeenNthCalledWith(2, fileB);
    expect(unlinkSpy).toHaveBeenNthCalledWith(1, fileA);
    expect(unlinkSpy).toHaveBeenNthCalledWith(2, fileB);
  });

  it('must rollback files from request.files object map', async () => {
    const imagePath = '/tmp/image.png';
    const docPath = '/tmp/doc.pdf';
    const error = new Error('mapped upload failed');

    context = {
      switchToHttp: () => ({
        getRequest: () =>
          ({
            files: {
              images: [{ path: imagePath }],
              docs: [{ path: docPath }],
            },
          }) as unknown as Request,
      }),
    } as ExecutionContext;

    const existsSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    const unlinkSpy = jest.spyOn(fs, 'unlinkSync').mockImplementation();

    (callHandler.handle as jest.Mock).mockReturnValue(throwError(() => error));

    await expect(
      lastValueFrom(interceptor.intercept(context, callHandler)),
    ).rejects.toBe(error);

    expect(existsSpy).toHaveBeenNthCalledWith(1, imagePath);
    expect(existsSpy).toHaveBeenNthCalledWith(2, docPath);
    expect(unlinkSpy).toHaveBeenNthCalledWith(1, imagePath);
    expect(unlinkSpy).toHaveBeenNthCalledWith(2, docPath);
  });

  it('must log delete failure and continue rethrowing original error', async () => {
    const filePath = '/tmp/upload-error.png';
    const originalError = new Error('request failed');

    context = {
      switchToHttp: () => ({
        getRequest: () =>
          ({
            file: { path: filePath },
          }) as Request,
      }),
    } as ExecutionContext;

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {
      throw new Error('permission denied');
    });
    const errorSpy = jest
      .spyOn(
        (
          interceptor as unknown as {
            logger: { error: (message: string) => void };
          }
        ).logger,
        'error',
      )
      .mockImplementation();

    (callHandler.handle as jest.Mock).mockReturnValue(
      throwError(() => originalError),
    );

    await expect(
      lastValueFrom(interceptor.intercept(context, callHandler)),
    ).rejects.toBe(originalError);

    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to delete file at /tmp/upload-error.png: permission denied',
    );
  });
});
