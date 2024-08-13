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
import { Service } from './service';
import { Employee } from './employee';
@Entity()
class ServiceAssignment extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => Service, (service) => service.serviceAssignments, {
    onDelete: 'CASCADE',
  })
  service: Service;

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
  service: Joi.number().required(),
  employee: Joi.number().required(),
});
export { ServiceAssignment, serviceAddOnSchema };
