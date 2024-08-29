import { AppDataSource } from '../connection';
import { ServiceAssignment } from '../entities/service.assignment';
import { BadRequestError } from '../errors/badRequestError';

export const ServiceAssignmentRepository = AppDataSource.getRepository(
  ServiceAssignment,
).extend({
  async createOrUpdate(
    serviceAssignmentObj: Partial<ServiceAssignment>,
  ): Promise<ServiceAssignment> {
    const exists = await this.createQueryBuilder('serviceAssignment')
      .where('serviceAssignment.employee = :employee', {
        employee:
          serviceAssignmentObj.employee?.id || serviceAssignmentObj.employee,
      })
      .andWhere('serviceAssignment.customerService = :customerService', {
        customerService:
          serviceAssignmentObj.customerService?.id ||
          serviceAssignmentObj.customerService,
      })
      .getOne();

    if (exists) {
      serviceAssignmentObj.updatedAt = new Date();
      this.merge(exists, serviceAssignmentObj);
      return this.save(exists);
    }
    return this.save(serviceAssignmentObj);
  },
  async deleteServiceAssignment(serviceAssignmentId: number): Promise<void> {
    const serviceAssignment = await this.findOne({
      where: {
        id: serviceAssignmentId,
      },
    });
    if (!serviceAssignment) {
      throw new BadRequestError('Service Assignment not found!');
    }
    await this.remove(serviceAssignment);
  },
  async deleteServiceAssignmentsByCustomerServiceId(
    customerServiceId: number,
  ): Promise<void> {
    await this.createQueryBuilder('serviceAssignment')
      .delete()
      .where('customerService = :customerService', {
        customerService: customerServiceId,
      })
      .execute();
  },
});
