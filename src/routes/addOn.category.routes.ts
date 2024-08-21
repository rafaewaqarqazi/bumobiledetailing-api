import AddOnCategoryController from '../controllers/addOn/addOn.category.controller';
import { jwtAuth } from '../policies/jwtAuth';
import { adminAuth } from '../policies/AdminAuth';

export default class AddOnCategoryRouter {
  public static definingAddOnCategoryRoutes(router: any) {
    router.post(
      '/addOnCategory',
      jwtAuth,
      adminAuth,
      AddOnCategoryController.createAddOnCategory,
    );
    router.put(
      '/addOnCategory',
      jwtAuth,
      adminAuth,
      AddOnCategoryController.updateAddOnCategory,
    );
    router.get(
      '/addOnCategory/list',
      jwtAuth,
      adminAuth,
      AddOnCategoryController.getAllAddOnCategories,
    );
    router.delete(
      '/addOnCategory/:id',
      jwtAuth,
      adminAuth,
      AddOnCategoryController.deleteAddOnCategory,
    );
    router.get(
      '/addOnCategory/:id',
      AddOnCategoryController.getAddOnCategoryById,
    );
  }
}
