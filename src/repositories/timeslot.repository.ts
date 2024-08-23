import { AppDataSource } from '../connection';
import { Timeslot } from '../entities/timeslot';
import { BadRequestError } from '../errors/badRequestError';

export const TimeslotRepository = AppDataSource?.getRepository(
  Timeslot,
)?.extend({
  async createTimeslot(timeslotObj: Timeslot): Promise<Timeslot> {
    const exists = await this.findOne({
      where: {
        time: timeslotObj.time,
        days: timeslotObj.days,
      },
    });
    if (exists) {
      throw new BadRequestError('Timeslot already exists!');
    }
    return this.save(timeslotObj);
  },
  async updateTimeslot(timeslotObj: Timeslot): Promise<Timeslot> {
    if (!timeslotObj.id) {
      throw new BadRequestError('Timeslot ID is required!');
    }
    const exists = await this.findOne({
      where: {
        id: timeslotObj.id,
      },
    });
    if (!exists) {
      throw new BadRequestError('Timeslot not found!');
    }
    if (timeslotObj.time !== exists.time || timeslotObj.days !== exists.days) {
      const timeExists = await this.findOne({
        where: {
          time: timeslotObj.time,
          days: timeslotObj.days,
        },
      });
      if (timeExists) {
        throw new BadRequestError('Timeslot already exists!');
      }
    }
    this.merge(exists, timeslotObj);
    return this.save(exists);
  },
  async one(timeslotId: number): Promise<Timeslot> {
    const timeslot = await this.findOne({
      where: {
        id: timeslotId,
      },
    });
    if (!timeslot) {
      throw new BadRequestError('Timeslot not found!');
    }
    return timeslot;
  },
  async deleteTimeslot(timeslotId: number): Promise<void> {
    const timeslot = await this.findOne({
      where: {
        id: timeslotId,
      },
    });
    if (!timeslot) {
      throw new BadRequestError('Timeslot not found!');
    }
    await this.remove(timeslot);
  },
  async list({
    current,
    pageSize,
    queryString,
  }: {
    current?: number;
    pageSize?: number;
    queryString?: string;
  }): Promise<[Timeslot[], number]> {
    const query = this.createQueryBuilder('timeslot');
    if (queryString) {
      query.where('timeslot.time like :queryString', {
        queryString: `%${queryString}%`,
      });
    }
    if (current && pageSize) {
      query.skip((current - 1) * pageSize).take(pageSize);
    }
    return query.orderBy('timeslot.createdAt', 'DESC').getManyAndCount();
  },

  async getTimeslotsByDate(date: string): Promise<Timeslot[]> {
    const dayOfWeek = new Date(date).getDay();
    return await this.createQueryBuilder('timeslot')
      .where(`FIND_IN_SET(${dayOfWeek}, timeslot.days)`)
      .leftJoinAndSelect('timeslot.schedules', 'schedule')
      .andWhere('schedule.date != :date', { date })
      .getMany();
  },
});
