import BookingController from '../controllers/booking/booking.controller';
import { jwtAuth } from '../policies/jwtAuth';
import { adminAuth } from '../policies/AdminAuth';

export default class BookingRouter {
  public static definingBookingRoutes(router: any) {
    router.post('/booking', BookingController.createBooking);
    router.get('/bookings', jwtAuth, adminAuth, BookingController.getBookings);
    router.get(
      '/booking/:id',
      jwtAuth,
      adminAuth,
      BookingController.getBookingById,
    );
    router.put(
      '/booking/:id/status',
      jwtAuth,
      adminAuth,
      BookingController.updateBookingStatus,
    );
    router.put(
      '/booking/:id/employee',
      jwtAuth,
      adminAuth,
      BookingController.updateBookingEmployee,
    );
    router.delete(
      '/booking/:id',
      jwtAuth,
      adminAuth,
      BookingController.deleteBooking,
    );
  }
}
