import { AppDataSource } from '../connection';
import { CustomerService } from '../entities/customer.service';
import { BadRequestError } from '../errors/badRequestError';

export const CustomerServiceRepository = AppDataSource.getRepository(
  CustomerService,
).extend({
  async createOrUpdate(
    customerServiceObj: Partial<CustomerService>,
  ): Promise<CustomerService> {
    const exists = await this.createQueryBuilder('customerService')
      .where('customerService.customer = :customer', {
        customer:
          customerServiceObj.customer?.id || customerServiceObj.customer,
      })
      .getOne();

    if (exists) {
      customerServiceObj.updatedAt = new Date();
      this.merge(exists, customerServiceObj);
      return this.save(exists);
    }
    return this.save(customerServiceObj);
  },
  async createCustomerService(
    customerServiceObj: Partial<CustomerService>,
  ): Promise<CustomerService> {
    return this.save(customerServiceObj);
  },
  async one(customerServiceId: number): Promise<CustomerService> {
    return this.findOne({
      where: {
        id: customerServiceId,
      },
      relations: [
        'service',
        'package',
        'schedule',
        'schedule.timeslot',
        'customerAddOns',
        'customerAddOns.addOn',
        'vehicle',
      ],
    });
  },
  async list({
    current,
    pageSize,
    queryString,
  }: {
    current?: number;
    pageSize?: number;
    queryString?: string;
  }): Promise<[CustomerService[], number]> {
    const query = this.createQueryBuilder('customerService')
      .leftJoinAndSelect('customerService.customer', 'customer')
      .leftJoinAndSelect('customerService.service', 'service')
      .leftJoinAndSelect('customerService.package', 'package')
      .leftJoinAndSelect('customerService.schedule', 'schedule')
      .leftJoinAndSelect('schedule.timeslot', 'timeslot')
      .leftJoinAndSelect('customerService.customerAddOns', 'customerAddOns')
      .leftJoinAndSelect('customerAddOns.addOn', 'addOn')
      .leftJoinAndSelect('customerService.vehicle', 'vehicle')
      .leftJoinAndSelect('customerService.quote', 'quote');
    if (queryString) {
      query.where('customerService.id = :id', { id: queryString });
    }
    if (current && pageSize) {
      query.skip((current - 1) * pageSize).take(pageSize);
    }
    return query.orderBy('customerService.createdAt', 'DESC').getManyAndCount();
  },
  async deleteCustomerService(customerServiceId: number): Promise<void> {
    const customerService = await this.findOne({
      where: {
        id: customerServiceId,
      },
    });
    if (!customerService) {
      throw new BadRequestError('Customer Service not found!');
    }
    await this.remove(customerService);
  },
});
