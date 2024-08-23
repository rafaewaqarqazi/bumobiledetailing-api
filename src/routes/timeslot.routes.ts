import TimeslotController from '../controllers/timeslot/timeslot.controller';
import { jwtAuth } from '../policies/jwtAuth';
import { adminAuth } from '../policies/AdminAuth';

export default class TimeslotRouter {
  public static definingTimeslotRoutes(router: any) {
    router.post(
      '/timeslot',
      jwtAuth,
      adminAuth,
      TimeslotController.createTimeslot,
    );
    router.put(
      '/timeslot',
      jwtAuth,
      adminAuth,
      TimeslotController.updateTimeslot,
    );
    router.get(
      '/timeslots',
      jwtAuth,
      adminAuth,
      TimeslotController.getAllTimeslots,
    );
    router.delete(
      '/timeslot/:id',
      jwtAuth,
      adminAuth,
      TimeslotController.deleteTimeslot,
    );
    router.get('/timeslot/:id', TimeslotController.getTimeslotById);
  }
}
