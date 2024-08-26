import { AppDataSource } from '../connection';
import { Schedule } from '../entities/schedule';
import { BadRequestError } from '../errors/badRequestError';

export const ScheduleRepository = AppDataSource.getRepository(Schedule).extend({
  async createOrUpdateSchedule(
    scheduleObj: Partial<Schedule>,
  ): Promise<Schedule> {
    const exists = await this.createQueryBuilder('schedule')
      .where('schedule.date = :date', { date: scheduleObj.date })
      .andWhere('schedule.timeslot = :timeslot', {
        timeslot: scheduleObj.timeslot?.id || scheduleObj.timeslot,
      })
      .andWhere('schedule.customer = :customer', {
        customer: scheduleObj.customer?.id || scheduleObj.customer,
      })
      .getOne();

    if (exists) {
      this.merge(exists, scheduleObj);
      return this.save(exists);
    }
    return this.save(scheduleObj);
  },
  async deleteSchedule(scheduleId: number): Promise<void> {
    const schedule = await this.findOne({
      where: {
        id: scheduleId,
      },
    });
    if (!schedule) {
      throw new BadRequestError('Schedule not found!');
    }
    await this.remove(schedule);
  },
});
