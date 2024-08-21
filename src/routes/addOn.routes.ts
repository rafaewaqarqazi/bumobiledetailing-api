import AddOnController from '../controllers/addOn/addOn.controller';
import { jwtAuth } from '../policies/jwtAuth';
import { adminAuth } from '../policies/AdminAuth';

export default class AddOnRouter {
  public static definingAddOnRoutes(router: any) {
    router.post('/addOn', jwtAuth, adminAuth, AddOnController.createAddOn);
    router.put('/addOn', jwtAuth, adminAuth, AddOnController.updateAddOn);
    router.get('/addOns', AddOnController.getAllAddOns);
    router.delete(
      '/addOn/:id',
      jwtAuth,
      adminAuth,
      AddOnController.deleteAddOn,
    );
    router.get('/addOn/:id', AddOnController.getAddOnById);
  }
}
