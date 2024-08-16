import AuthController from '../controllers/auth/auth.controller';

export default class AuthRouter {
  public static definingAuthRoutes(router: any) {
    router.post('/auth/login', AuthController.login);
    router.post('/auth/login-admin', AuthController.loginAdmin);
    router.post('/auth/login-employee', AuthController.loginEmployee);
    router.post('/auth/signup', AuthController.signup);
    router.post('/auth/signup-admin', AuthController.signupAdmin);
    // router.post('/auth/signup-employee', AuthController.signupEmployee);
    router.post('/auth/forgot-password', AuthController.forgotPassword);
    router.post('/auth/reset-password', AuthController.resetPassword);
  }
}
