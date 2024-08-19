import { SwaggerRouter } from 'koa-swagger-decorator';
import AuthRouter from './routes/auth.routes';
import EmployeeRouter from './routes/employee.routes';
import CustomerRouter from './routes/customer.routes';

const router: any = new SwaggerRouter({ prefix: '/api' });

AuthRouter.definingAuthRoutes(router);
EmployeeRouter.definingEmployeeRoutes(router);
CustomerRouter.definingCustomerRoutes(router);
// Swagger endpoint
router.swagger({
  title: 'BU Mobile Detailing API',
  version: '1.0.0',
  prefix: '/api',
  swaggerHtmlEndpoint: '/swagger-html',
});

router.mapDir(__dirname);

export { router };
