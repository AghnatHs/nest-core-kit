import { CallHandler, ExecutionContext } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { of } from 'rxjs';
import { DataResponse, MessageResponse } from '../http-response';
import { SuccessResponseInterceptor } from './success-response.interceptor';

describe('SuccessResponseInterceptor', () => {
  let interceptor: SuccessResponseInterceptor;
  let context: ExecutionContext;
  let callHandler: CallHandler;

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

    callHandler = {
      handle: jest.fn(),
    };
  });

  it('must return data as is when data is instance of MessageResponse', (done) => {
    const data: MessageResponse = new MessageResponse(200, 'only message');

    (callHandler.handle as jest.Mock).mockReturnValue(of(data));

    interceptor
      .intercept(context, callHandler)
      .subscribe((result: MessageResponse) => {
        expect(result).toBe(data);
        expect(result.message).toBe('only message');
        done();
      });
  });

  it('must return data as is when data is instance of DataResponse', (done) => {
    const data: DataResponse<Record<string, unknown>> = new DataResponse(
      200,
      'Data fetched successfully',
      {
        foo: 'bar',
      },
    );

    (callHandler.handle as jest.Mock).mockReturnValue(of(data));

    interceptor
      .intercept(context, callHandler)
      .subscribe((result: DataResponse<Record<string, unknown>>) => {
        expect(result).toBe(data);
        expect(result.data).toEqual({ foo: 'bar' });
        expect(result.message).toBe('Data fetched successfully');
        done();
      });
  });

  it('must wrap string data into MessageResponse', (done) => {
    const data: string = 'A plain string message';

    (callHandler.handle as jest.Mock).mockReturnValue(of(data));

    interceptor
      .intercept(context, callHandler)
      .subscribe((result: MessageResponse) => {
        expect(result).toBeInstanceOf(MessageResponse);
        expect(result.message).toBe(data);
        done();
      });
  });

  it('must return default success message for unknown data types', (done) => {
    const data: Record<string, unknown> = { foo: 'bar' };

    (callHandler.handle as jest.Mock).mockReturnValue(of(data));

    interceptor.intercept(context, callHandler).subscribe((result) => {
      expect(result).toBeInstanceOf(MessageResponse);
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Success');
      done();
    });
  });

  it('must return default success message for undefined data', (done) => {
    (callHandler.handle as jest.Mock).mockReturnValue(of(undefined));

    interceptor.intercept(context, callHandler).subscribe((result) => {
      expect(result).toBeInstanceOf(MessageResponse);
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Success');
      done();
    });
  });

  it('must use status code from response object (e.g., 201)', (done) => {
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

    (callHandler.handle as jest.Mock).mockReturnValue(of(data));

    interceptor.intercept(mockContext, callHandler).subscribe((result) => {
      expect(result).toBeInstanceOf(MessageResponse);
      expect(result.statusCode).toBe(201);
      expect(result.message).toBe('Created');
      done();
    });
  });
});
