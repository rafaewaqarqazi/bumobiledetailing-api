import { Context } from 'koa';
import { transports, format } from 'winston';
import dayjs from 'dayjs';

const logger = (winstonInstance: any): any => {
  winstonInstance.configure({
    level: 'info',
    transports: [
      //
      // - Write all logs error (and below) to `error.log`.
      new transports.File({ filename: 'error.log', level: 'error' }),
      //
      // - Write to all logs with specified level to console.
      new transports.Console({
        format: format.combine(format.colorize(), format.simple()),
      }),
    ],
  });

  return async (ctx: Context, next: () => Promise<any>): Promise<void> => {
    const start = new Date().getTime();

    await next();

    const ms = new Date().getTime() - start;

    let logLevel: string;
    if (ctx.status >= 500) {
      logLevel = 'error';
    } else if (ctx.status >= 400) {
      logLevel = 'warn';
    } else {
      logLevel = 'info';
    }

    const msg = `${ctx.method} ${dayjs().format('MM-DD-YYYY HH:mm')} ${ctx.originalUrl} ${ctx.status} ${ms}ms`;

    winstonInstance.log(logLevel, msg);
  };
};

export { logger };
