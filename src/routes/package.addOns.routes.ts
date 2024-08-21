import PackageAddOnsController from '../controllers/package/package.addOns.contoller';
import { jwtAuth } from '../policies/jwtAuth';
import { adminAuth } from '../policies/AdminAuth';

export default class PackageAddOnsRouter {
  public static definingPackageAddOnsRoutes(router: any) {
    router.post(
      '/packageAddOn',
      jwtAuth,
      adminAuth,
      PackageAddOnsController.createPackageAddOn,
    );
    router.delete(
      '/packageAddOn/:id',
      jwtAuth,
      adminAuth,
      PackageAddOnsController.deletePackageAddOn,
    );
  }
}
