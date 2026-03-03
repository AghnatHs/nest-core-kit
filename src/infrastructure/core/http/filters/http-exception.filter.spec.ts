/* eslint-disable @typescript-eslint/unbound-method */
import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { Logger } from 'nestjs-pino';
import { AllExceptionsFilter } from './http-exception.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: Partial<Response>;
  let mockHost: ArgumentsHost;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockLogger = {
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse as Response,
      }),
    } as unknown as ArgumentsHost;

    filter = new AllExceptionsFilter(mockLogger);
  });

  it('must handle string HttpException', () => {
    const exception = new HttpException('Not Found', 404);
    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      statusCode: 404,
      error: 'Not Found',
      errors: undefined,
    });
  });

  it('must handle object HttpException with string message', () => {
    const exception = new HttpException({ message: 'Forbidden' }, 403);
    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      statusCode: 403,
      error: 'Forbidden',
      errors: undefined,
    });
  });

  it('must handle object HttpException with array message', () => {
    const exception = new HttpException(
      { message: ['Validation error', 'Field X is required'] },
      422,
    );
    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(422);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      statusCode: 422,
      error: 'Validation error',
      errors: ['Validation error', 'Field X is required'],
    });
  });

  it('must handle other HttpException such as BadRequestException', () => {
    const exception = new BadRequestException('Bad Request');
    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      statusCode: 400,
      error: 'Bad Request',
      errors: undefined,
    });
  });

  it('must log internal server errors', () => {
    const exception = new InternalServerErrorException('Boom');
    filter.catch(exception, mockHost);

    expect(mockLogger.error).toHaveBeenCalledWith('Boom', expect.any(String));
  });
});
