import { ConfigService } from '@nestjs/config';
import { IncomingMessage, ServerResponse } from 'http';
import { Params } from 'nestjs-pino';
import * as path from 'path';

export function createPinoLoggerOptions(config: ConfigService): Params {
  const env = config.get<string>('app.environment');
  const logLevel: string = env === 'production' ? 'info' : 'debug';
  const appName = config.get<string>('app.name');

  const logsDir = path.join(process.cwd(), 'logs');

  return {
    pinoHttp: {
      level: 'trace',
      customLogLevel(_, res: ServerResponse<IncomingMessage>, err?: Error) {
        if (res.statusCode >= 500 || err) return 'error';
        if (res.statusCode >= 400) return 'warn';
        if (res.statusCode >= 300) return 'silent';
        return 'info';
      },
      customSuccessMessage(
        req: IncomingMessage,
        res: ServerResponse<IncomingMessage>,
      ) {
        return `${req.method} ${req.url} completed with status code ${res.statusCode}`;
      },
      customProps: () => ({
        context: `[${appName}]`,
        env: env,
      }),
      transport: {
        targets: [
          {
            target: 'pino-roll',
            level: logLevel,
            options: {
              file: `${logsDir}/app`,
              extension: 'log',
              frequency: 'daily',
              size: '20m',
              dateFormat: 'yyyy-MM-dd',
            },
          },
          {
            target: 'pino-pretty',
            level: logLevel,
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          },
        ],
      },
    },
  };
}
