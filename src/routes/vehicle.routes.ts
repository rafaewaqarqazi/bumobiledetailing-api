import VehicleController from '../controllers/vehicle/vehicle.controller';

export default class VehicleRouter {
  public static definingVehicleRoutes(router: any) {
    router.post('/vehicle', VehicleController.createVehicle);
    router.get('/vehicles', VehicleController.getVehicles);
  }
}
