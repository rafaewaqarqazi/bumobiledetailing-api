import { AppDataSource } from '../connection';
import { Package } from '../entities/package';
import { BadRequestError } from '../errors/badRequestError';
import { PackageAddOnsRepository } from './package.addOns.repository';

export const PackageRepository = AppDataSource?.getRepository(Package).extend({
  /**
   * @description Get one Package by id
   *
   * @param {number} id - The id of Package
   *
   */
  async one(id: number): Promise<Package> {
    if (!id) throw new BadRequestError('package id not provided');
    const _package = await this.findOne({
      where: {
        id,
      },
      relations: ['packageAddOns', 'packageAddOns.addOn'],
    });
    if (!_package) {
      throw new BadRequestError('Package not found!');
    }

    return _package;
  },

  /**
   * @description Create Package
   *
   * @param {object} packageObj - The packageObj of Package
   *
   */
  async createPackage(packageObj: Package): Promise<Package> {
    const packageAddons = packageObj.packageAddOns;
    delete packageObj.packageAddOns;
    const _package = await this.save(packageObj);
    if (packageAddons.length) {
      for (const packageAddOn of packageAddons) {
        packageAddOn.package = _package;
        await PackageAddOnsRepository.createOrUpdatePackageAddOn(packageAddOn);
      }
    }
    return _package;
  },

  /**
   * @description Update Package
   *
   * @param {object} packageObj - The packageObj of Package
   *
   */
  async updatePackage(packageObj: Package): Promise<Package> {
    const exists = await this.findOne({
      where: {
        id: packageObj.id,
      },
      relations: ['packageAddOns', 'packageAddOns.addOn'],
    });
    if (!exists) {
      throw new BadRequestError('Package not found!');
    }
    const packageAddons = packageObj.packageAddOns;
    delete packageObj.packageAddOns;
    this.merge(exists, packageObj);
    await this.save(exists);
    const existsPackageAddOns = exists.packageAddOns;
    const removedPackageAddOns = existsPackageAddOns.filter(
      (p) =>
        !packageAddons.some((pa) => p.addOn?.id === (pa.addOn?.id || pa.addOn)),
    );
    if (removedPackageAddOns.length) {
      for (const removedPackageAddOn of removedPackageAddOns) {
        await PackageAddOnsRepository.deletePackageAddOn(
          removedPackageAddOn.id,
        );
      }
    }
    if (packageAddons.length) {
      for (const packageAddOn of packageAddons) {
        packageAddOn.package = exists;
        await PackageAddOnsRepository.createOrUpdatePackageAddOn(packageAddOn);
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
  }): Promise<[Package[], number]> {
    const query = this.createQueryBuilder('package')
      .leftJoinAndSelect('package.packageAddOns', 'packageAddOns')
      .leftJoinAndSelect('packageAddOns.addOn', 'addOn');

    if (queryString) {
      query.where('package.name like :name', { name: `%${queryString}%` });
    }
    if (current && pageSize) {
      query.skip((current - 1) * pageSize).take(pageSize);
    }

    return await query.orderBy('package.createdAt', 'DESC').getManyAndCount();
  },
  async deletePackage(packageId: number): Promise<void> {
    const _package = await this.findOne({
      where: {
        id: packageId,
      },
    });
    if (!_package) {
      throw new BadRequestError('Package not found!');
    }
    await this.remove(_package);
  },
});
