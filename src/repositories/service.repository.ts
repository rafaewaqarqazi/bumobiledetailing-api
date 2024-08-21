import { AppDataSource } from '../connection';
import { Service } from '../entities/service';
import { BadRequestError } from '../errors/badRequestError';
import { ServicePackageRepository } from './service.package.repository';

export const ServiceRepository = AppDataSource.getRepository(Service).extend({
  /**
   * @description Get one Service by id
   *
   * @param {number} id - The id of Service
   *
   */
  async one(id: number): Promise<Service> {
    if (!id) throw new BadRequestError('service id not provided');
    const service = await this.findOne({
      where: {
        id,
      },
      relations: ['servicePackages', 'servicePackages.package'],
    });
    if (!service) {
      throw new BadRequestError('Service not found!');
    }

    return service;
  },

  /**
   * @description Create Service
   *
   * @param {object} serviceObj - The serviceObj of Service
   *
   */
  async createService(serviceObj: Service): Promise<Service> {
    const servicePackages = serviceObj.servicePackages;
    delete serviceObj.servicePackages;
    const service = await this.save(serviceObj);
    if (servicePackages.length) {
      for (const servicePackage of servicePackages) {
        servicePackage.service = service;
        await ServicePackageRepository.createOrUpdateServicePackage(
          servicePackage,
        );
      }
    }
    return service;
  },

  /**
   * @description Update Service
   *
   * @param {object} serviceObj - The serviceObj of Service
   *
   */
  async updateService(serviceObj: Service): Promise<Service> {
    const exists: Service = await this.findOne({
      where: {
        id: serviceObj.id,
      },
      relations: ['servicePackages', 'servicePackages.package'],
    });
    if (!exists) {
      throw new BadRequestError('Service not found!');
    }
    const servicePackages = serviceObj.servicePackages;
    delete serviceObj.servicePackages;
    this.merge(exists, serviceObj);
    await this.save(exists);
    const existsServicePackages = exists.servicePackages;
    const removedServicePackages = existsServicePackages.filter(
      (p) =>
        !servicePackages.some(
          (pa) => p.package?.id === (pa.package?.id || pa.package),
        ),
    );
    if (removedServicePackages.length) {
      for (const removedServicePackage of removedServicePackages) {
        await ServicePackageRepository.deleteServicePackage(
          removedServicePackage.id,
        );
      }
    }
    if (servicePackages.length) {
      for (const servicePackage of servicePackages) {
        const existsServicePackage = existsServicePackages.some(
          (p) =>
            p.package.id ===
            (servicePackage.package?.id || servicePackage.package),
        );
        if (existsServicePackage) {
          continue;
        }
        servicePackage.service = exists;
        await ServicePackageRepository.createOrUpdateServicePackage(
          servicePackage,
        );
      }
    }
    return exists;
  },
  async list({
    current,
    pageSize,
    queryString,
  }: {
    current?: number;
    pageSize?: number;
    queryString?: string;
  }): Promise<[Service[], number]> {
    const query = this.createQueryBuilder('service')
      .leftJoinAndSelect('service.servicePackages', 'servicePackages')
      .leftJoinAndSelect('servicePackages.package', 'package');
    if (queryString) {
      query.where('service.name like :name', { name: `%${queryString}%` });
    }

    if (current && pageSize) {
      query.skip((current - 1) * pageSize).take(pageSize);
    }
    return query.getManyAndCount();
  },
  async deleteService(id: number): Promise<number> {
    const service = await this.findOne({
      where: {
        id: id,
      },
    });
    if (!service) {
      throw new BadRequestError('Service not found!');
    }
    await this.remove(service);
    return id;
  },
});
