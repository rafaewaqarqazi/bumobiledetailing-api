import EmployeeController from '../controllers/employee/employee.controller';
import { jwtAuth } from '../policies/jwtAuth';
import { adminAuth } from '../policies/AdminAuth';

export default class EmployeeRouter {
  public static definingEmployeeRoutes(router: any) {
    router.post(
      '/employee',
      jwtAuth,
      adminAuth,
      EmployeeController.createEmployee,
    );
    router.put(
      '/employee',
      jwtAuth,
      adminAuth,
      EmployeeController.updateEmployee,
    );
    router.get(
      '/employees',
      jwtAuth,
      adminAuth,
      EmployeeController.getAllEmployees,
    );
    router.delete(
      '/employee/:id',
      jwtAuth,
      adminAuth,
      EmployeeController.deleteEmployee,
    );
    router.get(
      '/employee/:id',
      jwtAuth,
      adminAuth,
      EmployeeController.getEmployeeById,
    );
  }
}
