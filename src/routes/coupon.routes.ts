import CouponController from '../controllers/coupon/coupon.controller';
import { jwtAuth } from '../policies/jwtAuth';
import { adminAuth } from '../policies/AdminAuth';

export default class CouponRouter {
  public static definingCouponRoutes(router: any) {
    router.post('/coupon', jwtAuth, adminAuth, CouponController.createCoupon);
    router.put('/coupon', jwtAuth, adminAuth, CouponController.updateCoupon);
    router.get('/coupons', jwtAuth, adminAuth, CouponController.getAllCoupons);
    router.delete(
      '/coupon/:id',
      jwtAuth,
      adminAuth,
      CouponController.deleteCoupon,
    );
    router.get(
      '/coupon/:id',
      jwtAuth,
      adminAuth,
      CouponController.getCouponById,
    );
    router.get('/coupon/code/:code', CouponController.getCouponByCode);
  }
}
