import { jwtAuth } from '../policies/jwtAuth';
import { adminAuth } from '../policies/AdminAuth';
import AdminController from '../controllers/admin/admin.controller';

export default class AdminRouter {
  public static definingPackageRoutes(router: any) {
    router.post('/admin/file', jwtAuth, adminAuth, AdminController.uploadFile);
  }
}
