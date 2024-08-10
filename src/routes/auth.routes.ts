import AuthController from '../controllers/auth/auth.controller';

export default class AuthRouter {
  public static definingAuthRoutes(router: any) {
    router.post('/login', AuthController.login);
    // router.post('/forgot-password', AuthController.forgotPassword);
    // router.post('/reset-password', AuthController.resetPassword);
  }
}
