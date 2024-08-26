import BookingController from '../controllers/booking/booking.controller';
import { jwtAuth } from '../policies/jwtAuth';
import { adminAuth } from '../policies/AdminAuth';

export default class BookingRouter {
  public static definingBookingRoutes(router: any) {
    router.post('/booking', BookingController.createBooking);
    router.get('/bookings', jwtAuth, adminAuth, BookingController.getBookings);
    // router.delete(
    //   '/booking/:id',
    //   jwtAuth,
    //   adminAuth,
    //   BookingController.deletePackageAddOn,
    // );
  }
}
