import { AppDataSource } from '../connection';
import { BadRequestError } from '../errors/badRequestError';
import { ServicePackage } from '../entities/servicePackage';

export const ServicePackageRepository = AppDataSource.getRepository(
  ServicePackage,
).extend({
  async createOrUpdateServicePackage(
    servicePackageObj: ServicePackage,
  ): Promise<ServicePackage> {
    const exists: ServicePackage = await this.createQueryBuilder(
      'servicePackage',
    )
      .where('servicePackage.package = :packageId', {
        packageId: servicePackageObj.package?.id || servicePackageObj.package,
      })
      .andWhere('servicePackage.service = :serviceId', {
        serviceId: servicePackageObj.service?.id || servicePackageObj.service,
      })
      .getOne();
    if (exists) {
      this.merge(exists, servicePackageObj);
      return await this.save(exists);
    }

    return await this.save(servicePackageObj);
  },
  async createServicePackage(
    servicePackages: ServicePackage[],
  ): Promise<ServicePackage[]> {
    const servicePackagesList: ServicePackage[] = [];
    for (const servicePackage of servicePackages) {
      const newServicePackage =
        await this.createOrUpdateServicePackage(servicePackage);
      servicePackagesList.push(newServicePackage);
    }
    return servicePackagesList;
  },
  async deleteServicePackage(servicePackageId: number): Promise<void> {
    const servicePackage = await this.findOne({
      where: {
        id: servicePackageId,
      },
    });
    if (!servicePackage) {
      throw new BadRequestError('Package AddOn not found!');
    }
    await this.remove(servicePackage);
  },
  async updateServicePackage(
    id: number,
    servicePackageObj: Partial<ServicePackage>,
  ): Promise<ServicePackage> {
    const exists: ServicePackage = await this.findOne({
      where: {
        id,
      },
    });
    if (!exists) {
      throw new BadRequestError('Service Package not found!');
    }
    this.merge(exists, servicePackageObj);
    return await this.save(exists);
  },
});
