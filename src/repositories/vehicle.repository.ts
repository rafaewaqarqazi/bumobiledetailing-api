import { AppDataSource } from '../connection';
import { Vehicle } from '../entities/vehicle';
import { BadRequestError } from '../errors/badRequestError';

export const VehicleRepository = AppDataSource.getRepository(Vehicle).extend({
  async createOrUpdateVehicle(vehicleObj: Partial<Vehicle>): Promise<Vehicle> {
    const exists = await this.createQueryBuilder('vehicle')
      .andWhere('vehicle.customer = :customer', {
        customer: vehicleObj.customer?.id || vehicleObj.customer,
      })
      .getOne();

    if (exists) {
      this.merge(exists, vehicleObj);
      return this.save(exists);
    }
    return this.save(vehicleObj);
  },
  async deleteVehicle(vehicleId: number): Promise<void> {
    const vehicle = await this.findOne({
      where: {
        id: vehicleId,
      },
    });
    if (!vehicle) {
      throw new BadRequestError('Vehicle not found!');
    }
    await this.remove(vehicle);
  },
});
