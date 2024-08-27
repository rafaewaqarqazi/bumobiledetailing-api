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
    customerAddOnObj: Partial<CustomerAddOn>,
  ): Promise<CustomerAddOn> {
    return this.save(customerAddOnObj);
  },
  async deleteCustomerAddOn(customerAddOnId: number): Promise<void> {
    const customerAddOn = await this.findOne({
      where: {
        id: customerAddOnId,
      },
    });
    if (!customerAddOn) {
      throw new BadRequestError('Customer AddOn not found!');
    }
    await this.remove(customerAddOn);
  },
  async deleteCustomerAddOnsByCustomerServiceId(
    customerServiceId: number,
  ): Promise<void> {
    await this.createQueryBuilder('customerAddOn')
      .delete()
      .where('customerService = :customerService', {
        customerService: customerServiceId,
      })
      .execute();
  },
});
