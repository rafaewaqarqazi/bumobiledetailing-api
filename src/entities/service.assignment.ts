import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeUpdate,
  BeforeInsert,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import Joi from 'joi';
import { Employee } from './employee';
import { CustomerService } from './customer.service';
@Entity()
class ServiceAssignment extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(
    () => CustomerService,
    (customerService) => customerService.serviceAssignments,
    {
      onDelete: 'CASCADE',
    },
  )
  customerService: CustomerService;

  @ManyToOne(() => Employee, (employee) => employee.serviceAssignments, {
    onDelete: 'CASCADE',
  })
  employee: Employee;
  // Generic Fields
  @Column({ nullable: true, type: 'datetime', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ nullable: true, type: 'datetime', default: () => 'NOW()' })
  updatedAt: Date;

  // typeORM listeners (HOOKS)
  @BeforeUpdate()
  beforeupdate() {
    this.updatedAt = new Date();
  }

  @BeforeInsert()
  beforeinsert() {
    this.createdAt = new Date();
  }
}

// Validation Schema
const serviceAddOnSchema = Joi.object({
  employee: Joi.number().required(),
  customerService: Joi.number().required(),
});
export { ServiceAssignment, serviceAddOnSchema };
