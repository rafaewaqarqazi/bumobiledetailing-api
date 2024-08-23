import { AppDataSource } from '../connection';
import { AddOnCategory } from '../entities/addOn.category';
import { BadRequestError } from '../errors/badRequestError';

export const AddOnCategoryRepository = AppDataSource?.getRepository(
  AddOnCategory,
)?.extend({
  async createAddOnCategory(
    addOnCategoryObj: AddOnCategory,
  ): Promise<AddOnCategory> {
    const exists = await this.findOne({
      where: {
        name: addOnCategoryObj.name,
      },
    });
    if (exists) {
      throw new BadRequestError('AddOn Category already exists!');
    }
    return this.save(addOnCategoryObj);
  },
  async updateAddOnCategory(
    addOnCategoryObj: AddOnCategory,
  ): Promise<AddOnCategory> {
    if (!addOnCategoryObj.id) {
      throw new BadRequestError('AddOn Category ID is required!');
    }
    const exists = await this.findOne({
      where: {
        id: addOnCategoryObj.id,
      },
    });
    if (!exists) {
      throw new BadRequestError('AddOn Category not found!');
    }
    if (addOnCategoryObj.name !== exists.name) {
      const nameExists = await this.findOne({
        where: {
          name: addOnCategoryObj.name,
        },
      });
      if (nameExists) {
        throw new BadRequestError('AddOn Category already exists!');
      }
    }
    this.merge(exists, addOnCategoryObj);
    return this.save(exists);
  },
  async one(addOnCategoryId: number): Promise<AddOnCategory> {
    const addOnCategory = await this.findOne({
      where: {
        id: addOnCategoryId,
      },
    });
    if (!addOnCategory) {
      throw new BadRequestError('AddOn Category not found!');
    }
    return addOnCategory;
  },
  async deleteAddOnCategory(addOnCategoryId: number): Promise<void> {
    const addOnCategory = await this.findOne({
      where: {
        id: addOnCategoryId,
      },
    });
    if (!addOnCategory) {
      throw new BadRequestError('AddOn Category not found!');
    }
    await this.remove(addOnCategory);
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
    const query = this.createQueryBuilder('addOnCategory');
    if (queryString) {
      query.where('addOnCategory.name like :queryString', {
        queryString: `%${queryString}%`,
      });
    }
    if (current && pageSize) {
      query.skip((current - 1) * pageSize).take(pageSize);
    }
    return query.orderBy('addOnCategory.updatedAt', 'DESC').getManyAndCount();
  },
});
