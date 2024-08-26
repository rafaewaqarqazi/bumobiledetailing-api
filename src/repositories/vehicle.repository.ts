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
      vehicleObj.updatedAt = new Date();
      this.merge(exists, vehicleObj);
      return this.save(exists);
    }
    return this.save(vehicleObj);
  },
  async list({
    current,
    pageSize,
    queryString,
  }: {
    current?: number;
    pageSize?: number;
    queryString?: string;
  }): Promise<[Vehicle[], number]> {
    const query = this.createQueryBuilder('vehicle').leftJoinAndSelect(
      'vehicle.customer',
      'customer',
    );

    if (queryString) {
      query.where(
        'vehicle.make LIKE :queryString OR vehicle.model LIKE :queryString OR vehicle.licensePlate LIKE :queryString',
        { queryString: `%${queryString}%` },
      );
    }
    if (current && pageSize) {
      query.skip((current - 1) * pageSize).take(pageSize);
    }
    return query.orderBy('vehicle.updatedAt', 'DESC').getManyAndCount();
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
