import { AppDataSource } from '../connection';
import { SMSCron } from '../entities/smsCron';
import { BadRequestError } from '../errors/badRequestError';

export const SmsCronRepository = AppDataSource.getRepository(SMSCron).extend({
  async createOrUpdate(obj: Partial<SMSCron>): Promise<SMSCron> {
    const exists = await this.findOne({
      where: {
        name: obj.id,
      },
    });
    if (exists) {
      this.merge(exists, obj);
      return await this.save(exists);
    }
    return await this.save(obj);
  },
  async oneById(id: number): Promise<SMSCron> {
    const smsCron = await this.findOne({
      where: {
        id: id,
      },
    });
    if (!smsCron) {
      throw new BadRequestError('SMS Cron not found!');
    }
    return smsCron;
  },
  async list({
    pageNo,
    perPage,
    queryString,
  }: {
    pageNo?: number;
    perPage?: number;
    queryString?: string;
  }): Promise<[SMSCron[], number]> {
    const query = this.createQueryBuilder('smsCron').leftJoinAndSelect(
      'smsCron.customer',
      'customer',
    );
    if (queryString) {
      query.where(
        '(customer.fistName LIKE :queryString OR customer.lastName LIKE :queryString OR customer.email LIKE :queryString OR customer.phone LIKE :queryString)',
        { queryString: `%${queryString}%` },
      );
    }
    if (perPage && pageNo) {
      query.skip((pageNo - 1) * perPage).take(perPage);
    }
    const [smsCron, count] = await query.getManyAndCount();
    return [smsCron, count];
  },
});
