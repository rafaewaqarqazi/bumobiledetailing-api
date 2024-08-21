import ServiceController from '../controllers/service/service.controller';
import { jwtAuth } from '../policies/jwtAuth';
import { adminAuth } from '../policies/AdminAuth';

export default class ServiceRouter {
  public static definingServiceRoutes(router: any) {
    router.post(
      '/service',
      jwtAuth,
      adminAuth,
      ServiceController.createService,
    );
    router.put('/service', jwtAuth, adminAuth, ServiceController.updateService);
    router.get('/services', ServiceController.getAllServices);
    router.delete(
      '/service/:id',
      jwtAuth,
      adminAuth,
      ServiceController.deleteService,
    );
    router.get('/service/:id', ServiceController.getServiceById);
  }
}
