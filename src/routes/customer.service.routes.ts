import CustomerServiceController from '../controllers/customer/customer.service.controller';

export default class CustomerServiceRouter {
  public static definingCustomerServiceRoutes(router: any) {
    router.post(
      '/customer-service',
      CustomerServiceController.createCustomerService,
    );
  }
}
