import { CallHandler, ExecutionContext } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface';
import { firstValueFrom, of } from 'rxjs';
import { type Mock, vi } from 'vitest';
import { DataResponse, MessageResponse } from '../http-response';
import { SuccessResponseInterceptor } from './success-response.interceptor';

describe('SuccessResponseInterceptor', () => {
  let interceptor: SuccessResponseInterceptor;
  let context: ExecutionContext;
  let callHandler: CallHandler;
  let handleMock: Mock;

  beforeEach(() => {
    interceptor = new SuccessResponseInterceptor();
    context = {
      switchToHttp: () =>
        ({
          getRequest: () => ({}),
          getResponse: () => ({ statusCode: 200 }), // default fallback
          getNext: () => ({}),
        }) as HttpArgumentsHost,
    } as ExecutionContext;

    handleMock = vi.fn();
    callHandler = {
      handle: handleMock,
    };
  });

  it('must return data as is when data is instance of MessageResponse', async () => {
    const data: MessageResponse = new MessageResponse(200, 'only message');

    handleMock.mockReturnValue(of(data));

    const result = await firstValueFrom(
      interceptor.intercept(context, callHandler),
    );

    expect(result).toBe(data);
    expect(result.message).toBe('only message');
  });

  it('must return data as is when data is instance of DataResponse', async () => {
    const data: DataResponse<Record<string, unknown>> = new DataResponse(
      200,
      'Data fetched successfully',
      {
        foo: 'bar',
      },
    );

    handleMock.mockReturnValue(of(data));

    const result = await firstValueFrom(
      interceptor.intercept(context, callHandler),
    );

    expect(result).toBe(data);
    expect((result as DataResponse<Record<string, unknown>>).data).toEqual({
      foo: 'bar',
    });
    expect(result.message).toBe('Data fetched successfully');
  });

  it('must wrap string data into MessageResponse', async () => {
    const data: string = 'A plain string message';

    handleMock.mockReturnValue(of(data));

    const result = await firstValueFrom(
      interceptor.intercept(context, callHandler),
    );

    expect(result).toBeInstanceOf(MessageResponse);
    expect(result.message).toBe(data);
  });

  it('must return default success message for unknown data types', async () => {
    const data: Record<string, unknown> = { foo: 'bar' };

    handleMock.mockReturnValue(of(data));

    const result = await firstValueFrom(
      interceptor.intercept(context, callHandler),
    );

    expect(result).toBeInstanceOf(MessageResponse);
    expect(result.statusCode).toBe(200);
    expect(result.message).toBe('Success');
  });

  it('must return default success message for undefined data', async () => {
    handleMock.mockReturnValue(of(undefined));

    const result = await firstValueFrom(
      interceptor.intercept(context, callHandler),
    );

    expect(result).toBeInstanceOf(MessageResponse);
    expect(result.statusCode).toBe(200);
    expect(result.message).toBe('Success');
  });

  it('must use status code from response object (e.g., 201)', async () => {
    const data = 'Created';

    // simulate @HttpCode(201)
    const mockContext: ExecutionContext = {
      switchToHttp: () =>
        ({
          getRequest: () => ({}),
          getResponse: () => ({ statusCode: 201 }),
          getNext: () => ({}),
        }) as HttpArgumentsHost,
    } as ExecutionContext;

    handleMock.mockReturnValue(of(data));

    const result = await firstValueFrom(
      interceptor.intercept(mockContext, callHandler),
    );

    expect(result).toBeInstanceOf(MessageResponse);
    expect(result.statusCode).toBe(201);
    expect(result.message).toBe('Created');
  });
});
