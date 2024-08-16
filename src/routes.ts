import { SwaggerRouter } from 'koa-swagger-decorator';
import AuthRouter from './routes/auth.routes';
import EmployeeRouter from './routes/employee.routes';

const router: any = new SwaggerRouter({ prefix: '/api' });

AuthRouter.definingAuthRoutes(router);
EmployeeRouter.definingEmployeeRoutes(router);
// Swagger endpoint
router.swagger({
  title: 'BU Mobile Detailing API',
  version: '1.0.0',
  prefix: '/api',
  swaggerHtmlEndpoint: '/swagger-html',
});

router.mapDir(__dirname);

export { router };
