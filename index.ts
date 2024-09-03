import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import Koa from 'koa';
import koaBody from 'koa-body';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import winston from 'winston';

import 'reflect-metadata';
import { logger } from './src/logger';
import { config } from './src/config';
import { userAgent } from 'koa-useragent';
import { AppDataSource } from './src/connection';
import { router } from './src/routes';
import { handleSocket } from './src/services/socket.service';

/**
 * Creating Connection With database
 */
console.log(`Connecting to DB... ${config.port}`);
let io: any;
AppDataSource.initialize()
  .then(async () => {
    console.log(`Connected to DB ${config.port}`);

    const app = new Koa({ proxy: true });
    app.use(userAgent);
    app.use(koaBody({ multipart: true }));

    // Centralized ErrorHandling
    app.use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        ctx.status = err.status || 400;
        ctx.body = {
          statusCode: err.status || 400,
          response: {
            message: 'Something Went Wrong, Kindly Contact Support',
            data: {
              err: err,
            },
          },
        };
      }
    });

    // Provides important security headers to make your app more secure
    // app.use(
    //   helmet({
    //     contentSecurityPolicy: process.env.NODE_ENV === 'development',
    //   })
    // );

    // Enable cors with default options
    app.use(cors());

    // Logger middleware -> use winston as logger (logging.ts with config)
    app.use(logger(winston));

    // Enable bodyParser with default options
    app.use(bodyParser());

    app.use(router.routes()).use(router.allowedMethods());
    router.get('/status', (ctx) => {
      ctx.body = {
        ok: true,
        ts: process.env.GIT_SHA_TS,
        sha: process.env.GIT_SHA,
      };
    });
    const server = require('http').createServer(app.callback());
    io = require('socket.io')(server, {
      cors: {
        origin: '*',
      },
    });
    io.on('connection', handleSocket);
    server.listen(config.port);

    console.log(`Server running on port ${config.port}`);
  })
  .catch((error: string) => console.log('TypeORM connection error: ', error));
export { io };
