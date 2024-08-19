import CustomerController from '../controllers/customer/customer.controller';
import { jwtAuth } from '../policies/jwtAuth';
import { adminAuth } from '../policies/AdminAuth';

export default class CustomerRouter {
  public static definingCustomerRoutes(router: any) {
    router.post('/customer', CustomerController.createCustomer);
    router.put(
      '/customer',
      jwtAuth,
      adminAuth,
      CustomerController.updateCustomer,
    );
    router.get(
      '/customers',
      jwtAuth,
      adminAuth,
      CustomerController.getAllCustomers,
    );
    router.delete(
      '/customer/:id',
      jwtAuth,
      adminAuth,
      CustomerController.deleteCustomer,
    );
    router.get(
      '/customer/:id',
      jwtAuth,
      adminAuth,
      CustomerController.getCustomerById,
    );
  }
}
