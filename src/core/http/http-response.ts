import { instanceToPlain } from 'class-transformer';

/**
 * Abstract base class representing a HTTP response structure.
 *
 * @property {boolean} success - Indicates whether the HTTP request was successful. Defaults to `true`.
 * @property {number} statusCode - The HTTP status code associated with the response.
 * @property {string} message - A descriptive message providing additional information about the response.
 */
export abstract class HTTPResponse {
  success: boolean = true;
  statusCode: number;
  message: string;
}

/**
 * a generic HTTP response containing a status code and only a message.
 *
 * @extends HTTPResponse
 *
 * @param {number} statusCode - The HTTP status code to be set for the response.
 * @param {number} message - The message to be included in the response body.
 */
export class MessageResponse extends HTTPResponse {
  constructor(statusCode: number, message: string) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

/**
 * A generic HTTP response that includes a data payload.
 * @extends MessageResponse
 * @template T - The type of the data payload.
 *
 * @property {T} data - The data payload returned in the response.
 *
 * @param {number} statusCode - The HTTP status code of the response.
 * @param {string} message - A message describing the response.
 * @param {T} data - The data payload to include in the response.
 */
export class DataResponse<T> extends MessageResponse {
  readonly data: T;

  constructor(statusCode: number, message: string, data: T) {
    super(statusCode, message);
    this.data = instanceToPlain(data) as T;
  }
}
