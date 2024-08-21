import { AppDataSource } from '../connection';
import { PackageAddOn } from '../entities/package.addOn';
import { BadRequestError } from '../errors/badRequestError';

export const PackageAddOnsRepository = AppDataSource.getRepository(
  PackageAddOn,
).extend({
  async createOrUpdatePackageAddOn(
    packageAddOnObj: PackageAddOn,
  ): Promise<PackageAddOn> {
    const exists: PackageAddOn = await this.createQueryBuilder('packageAddOn')
      .where('packageAddOn.package = :packageId', {
        packageId: packageAddOnObj.package?.id || packageAddOnObj.package,
      })
      .andWhere('packageAddOn.addOn = :addOnId', {
        addOnId: packageAddOnObj.addOn?.id || packageAddOnObj.addOn,
      })
      .getOne();
    if (exists) {
      this.merge(exists, packageAddOnObj);
      return await this.save(exists);
    }

    return await this.save(packageAddOnObj);
  },
  async createPackageAddOns(
    packageAddOns: PackageAddOn[],
  ): Promise<PackageAddOn[]> {
    const packageAddOnsList: PackageAddOn[] = [];
    for (const packageAddOn of packageAddOns) {
      const newPackageAddOn =
        await this.createOrUpdatePackageAddOn(packageAddOn);
      packageAddOnsList.push(newPackageAddOn);
    }
    return packageAddOnsList;
  },
  async deletePackageAddOn(packageAddOnId: number): Promise<void> {
    const packageAddOn = await this.findOne({
      where: {
        id: packageAddOnId,
      },
    });
    if (!packageAddOn) {
      throw new BadRequestError('Package AddOn not found!');
    }
    await this.remove(packageAddOn);
  },
});
