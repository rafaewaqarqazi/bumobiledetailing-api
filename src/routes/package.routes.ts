import PackageController from '../controllers/package/package.controller';
import { jwtAuth } from '../policies/jwtAuth';
import { adminAuth } from '../policies/AdminAuth';

export default class PackageRouter {
  public static definingPackageRoutes(router: any) {
    router.post(
      '/package',
      jwtAuth,
      adminAuth,
      PackageController.createPackage,
    );
    router.put('/package', jwtAuth, adminAuth, PackageController.updatePackage);
    router.get('/packages', PackageController.getAllPackages);
    router.delete(
      '/package/:id',
      jwtAuth,
      adminAuth,
      PackageController.deletePackage,
    );
    router.get('/package/:id', PackageController.getPackageById);
  }
}
