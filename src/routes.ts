import { SwaggerRouter } from 'koa-swagger-decorator';
import AuthRouter from './routes/auth.routes';

const router: any = new SwaggerRouter({ prefix: '/api' });

AuthRouter.definingAuthRoutes(router);

// Swagger endpoint
router.swagger({
  title: 'Intake API',
  version: '1.0.0',
  prefix: '/api',
  swaggerHtmlEndpoint: '/swagger-html',
});

router.mapDir(__dirname);

export { router };
