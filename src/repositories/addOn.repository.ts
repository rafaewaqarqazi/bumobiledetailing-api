import { AppDataSource } from '../connection';
import { AddOn } from '../entities/addOn';
import { BadRequestError } from '../errors/badRequestError';

export const AddOnRepository = AppDataSource.getRepository(AddOn).extend({
  /**
   * @description Get one AddOn by id
   *
   * @param {number} id - The id of AddOn
   *
   */
  async one(id: number): Promise<AddOn> {
    if (!id) throw new BadRequestError('addOn id not provided');
    const addOn = await this.findOne({
      where: {
        id,
      },
      relations: ['category'],
    });
    if (!addOn) {
      throw new BadRequestError('AddOn not found!');
    }

    return addOn;
  },

  /**
   * @description Create AddOn
   *
   * @param {object} addOnObj - The addOnObj of AddOn
   *
   */
  async createAddOn(addOnObj: AddOn): Promise<AddOn> {
    return this.save(addOnObj);
  },

  /**
   * @description Update AddOn
   *
   * @param {object} addOnObj - The addOnObj of AddOn
   *
   */
  async updateAddOn(addOnObj: AddOn): Promise<AddOn> {
    const exists: AddOn = await this.findOne({
      where: {
        id: addOnObj.id,
      },
    });
    if (!exists) {
      throw new BadRequestError('AddOn not found!');
    }
    addOnObj.updatedAt = new Date();
    this.merge(exists, addOnObj);
    return this.save(exists);
  },
  async list({
    current,
    pageSize,
    queryString,
    categoryId,
  }: {
    current?: number;
    pageSize?: number;
    queryString?: string;
    categoryId?: number;
  }): Promise<[AddOn[], number]> {
    const query = this.createQueryBuilder('addOn').leftJoinAndSelect(
      'addOn.category',
      'category',
    );
    if (queryString) {
      query.where('addOn.name like :name', { name: `%${queryString}%` });
    }
    if (categoryId) {
      query.andWhere('addOn.category = :categoryId', { categoryId });
    }
    if (current && pageSize) {
      query.skip((current - 1) * pageSize).take(pageSize);
    }
    return query.getManyAndCount();
  },
  async deleteAddOn(id: number): Promise<number> {
    const addOn = await this.findOne({
      where: {
        id: id,
      },
    });
    if (!addOn) {
      throw new BadRequestError('AddOn not found!');
    }
    await this.remove(addOn);
    return id;
  },
});
