import { AppDataSource } from '../connection';
import { AddOnCategory } from '../entities/addOn.category';
import { BadRequestError } from '../errors/badRequestError';

export const AddOnCategoryRepository = AppDataSource?.getRepository(
  AddOnCategory,
)?.extend({
  async createAddOnCategory(
    serviceCategoryObj: AddOnCategory,
  ): Promise<AddOnCategory> {
    const exists = await this.findOne({
      where: {
        name: serviceCategoryObj.name,
      },
    });
    if (exists) {
      throw new BadRequestError('AddOn Category already exists!');
    }
    return this.save(serviceCategoryObj);
  },
  async updateAddOnCategory(
    serviceCategoryObj: AddOnCategory,
  ): Promise<AddOnCategory> {
    if (!serviceCategoryObj.id) {
      throw new BadRequestError('AddOn Category ID is required!');
    }
    const exists = await this.findOne({
      where: {
        id: serviceCategoryObj.id,
      },
    });
    if (!exists) {
      throw new BadRequestError('AddOn Category not found!');
    }
    if (serviceCategoryObj.name !== exists.name) {
      const nameExists = await this.findOne({
        where: {
          name: serviceCategoryObj.name,
        },
      });
      if (nameExists) {
        throw new BadRequestError('AddOn Category already exists!');
      }
    }
    this.merge(exists, serviceCategoryObj);
    return this.save(exists);
  },
  async one(serviceCategoryId: number): Promise<AddOnCategory> {
    const serviceCategory = await this.findOne({
      where: {
        id: serviceCategoryId,
      },
    });
    if (!serviceCategory) {
      throw new BadRequestError('AddOn Category not found!');
    }
    return serviceCategory;
  },
  async deleteAddOnCategory(serviceCategoryId: number): Promise<void> {
    const serviceCategory = await this.findOne({
      where: {
        id: serviceCategoryId,
      },
    });
    if (!serviceCategory) {
      throw new BadRequestError('AddOn Category not found!');
    }
    await this.remove(serviceCategory);
  },
  async list({
    current,
    pageSize,
    queryString,
  }: {
    current?: number;
    pageSize?: number;
    queryString?: string;
  }): Promise<[AddOnCategory[], number]> {
    const query = this.createQueryBuilder('serviceCategory');
    if (queryString) {
      query.where('serviceCategory.name like :queryString', {
        queryString: `%${queryString}%`,
      });
    }
    if (current && pageSize) {
      query.skip((current - 1) * pageSize).take(pageSize);
    }
    return query.orderBy('serviceCategory.updatedAt', 'DESC').getManyAndCount();
  },
});
