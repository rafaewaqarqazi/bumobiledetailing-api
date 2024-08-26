import { AppDataSource } from '../connection';
import { CustomerAddOn } from '../entities/customer.addOn';
import { BadRequestError } from '../errors/badRequestError';

export const CustomerAddOnRepository = AppDataSource.getRepository(
  CustomerAddOn,
).extend({
  async createOrUpdate(
    customerAddOnObj: Partial<CustomerAddOn>,
  ): Promise<CustomerAddOn> {
    const exists = await this.createQueryBuilder('customerAddOn')
      .where('customerAddOn.customer = :customer', {
        customer: customerAddOnObj.customer?.id || customerAddOnObj.customer,
      })
      .andWhere('customerAddOn.customerService = :customerService', {
        customerService:
          customerAddOnObj.customerService?.id ||
          customerAddOnObj.customerService,
      })
      .andWhere('customerAddOn.addOn = :addOn', {
        addOn: customerAddOnObj.addOn?.id || customerAddOnObj.addOn,
      })
      .getOne();

    if (exists) {
      customerAddOnObj.updatedAt = new Date();
      this.merge(exists, customerAddOnObj);
      return this.save(exists);
    }
    return this.save(customerAddOnObj);
  },
  async createCustomerAddOn(
    scheduleObj: Partial<CustomerAddOn>,
  ): Promise<CustomerAddOn> {
    return this.save(scheduleObj);
  },
  async deleteCustomerAddOn(scheduleId: number): Promise<void> {
    const schedule = await this.findOne({
      where: {
        id: scheduleId,
      },
    });
    if (!schedule) {
      throw new BadRequestError('Customer AddOn not found!');
    }
    await this.remove(schedule);
  },
});
