import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import * as fs from 'fs';
import { lastValueFrom, of, throwError } from 'rxjs';
import { FileRollbackInterceptor } from './file-rollback.interceptor';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

describe('FileRollbackInterceptor', () => {
  let interceptor: FileRollbackInterceptor;
  let context: ExecutionContext;
  let callHandler: CallHandler;
  let existsSyncMock: jest.MockedFunction<typeof fs.existsSync>;
  let unlinkSyncMock: jest.MockedFunction<typeof fs.unlinkSync>;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    existsSyncMock = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>;
    unlinkSyncMock = fs.unlinkSync as jest.MockedFunction<typeof fs.unlinkSync>;
    existsSyncMock.mockReset();
    unlinkSyncMock.mockReset();

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
        getRequest: () => ({}) as unknown as Request,
      }),
    } as ExecutionContext;

    callHandler = {
      handle: jest.fn(),
    };
  });

  it('must pass through successful response without deleting files', async () => {
    (callHandler.handle as jest.Mock).mockReturnValue(of('ok'));

    await expect(
      lastValueFrom(interceptor.intercept(context, callHandler)),
    ).resolves.toBe('ok');

    expect(existsSyncMock).not.toHaveBeenCalled();
    expect(unlinkSyncMock).not.toHaveBeenCalled();
  });

  it('must rollback single uploaded file and rethrow error', async () => {
    const filePath = '/tmp/upload-1.png';
    const error = new Error('request failed');

    context = {
      switchToHttp: () => ({
        getRequest: () =>
          ({
            file: { path: filePath },
          }) as unknown as Request,
      }),
    } as ExecutionContext;

    existsSyncMock.mockReturnValue(true);
    unlinkSyncMock.mockImplementation();
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
    expect(existsSyncMock).toHaveBeenCalledWith(filePath);
    expect(unlinkSyncMock).toHaveBeenCalledWith(filePath);
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
          }) as unknown as Request,
      }),
    } as ExecutionContext;

    existsSyncMock.mockReturnValue(true);
    unlinkSyncMock.mockImplementation();

    (callHandler.handle as jest.Mock).mockReturnValue(throwError(() => error));

    await expect(
      lastValueFrom(interceptor.intercept(context, callHandler)),
    ).rejects.toBe(error);

    expect(existsSyncMock).toHaveBeenNthCalledWith(1, fileA);
    expect(existsSyncMock).toHaveBeenNthCalledWith(2, fileB);
    expect(unlinkSyncMock).toHaveBeenNthCalledWith(1, fileA);
    expect(unlinkSyncMock).toHaveBeenNthCalledWith(2, fileB);
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

    existsSyncMock.mockReturnValue(true);
    unlinkSyncMock.mockImplementation();

    (callHandler.handle as jest.Mock).mockReturnValue(throwError(() => error));

    await expect(
      lastValueFrom(interceptor.intercept(context, callHandler)),
    ).rejects.toBe(error);

    expect(existsSyncMock).toHaveBeenNthCalledWith(1, imagePath);
    expect(existsSyncMock).toHaveBeenNthCalledWith(2, docPath);
    expect(unlinkSyncMock).toHaveBeenNthCalledWith(1, imagePath);
    expect(unlinkSyncMock).toHaveBeenNthCalledWith(2, docPath);
  });

  it('must log delete failure and continue rethrowing original error', async () => {
    const filePath = '/tmp/upload-error.png';
    const originalError = new Error('request failed');

    context = {
      switchToHttp: () => ({
        getRequest: () =>
          ({
            file: { path: filePath },
          }) as unknown as Request,
      }),
    } as ExecutionContext;

    existsSyncMock.mockReturnValue(true);
    unlinkSyncMock.mockImplementation(() => {
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
