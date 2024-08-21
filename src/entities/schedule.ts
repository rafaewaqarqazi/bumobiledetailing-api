import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import Joi from 'joi';
import { Employee } from './employee';
import { CustomerService } from './customer.service';
@Entity()
class Schedule extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: false, type: 'datetime' })
  startAt: Date;

  @Column({ nullable: false, type: 'datetime' })
  endAt: Date;

  @Column({ nullable: false })
  statusId: number;

  @ManyToOne(() => Employee, (employee) => employee.schedules, {
    onDelete: 'CASCADE',
  })
  employee: Employee;

  @ManyToOne(
    () => CustomerService,
    (customerService) => customerService.schedules,
    {
      onDelete: 'CASCADE',
    },
  )
  customerService: CustomerService;

  // Generic Fields
  @Column({ nullable: true, type: 'datetime', default: () => 'NOW()' })
  createdAt: Date;

  // typeORM listeners (HOOKS)

  @BeforeInsert()
  beforeinsert() {
    this.createdAt = new Date();
  }
}

// Validation Schema
const scheduleSchema = Joi.object({
  startAt: Joi.date().required(),
  endAt: Joi.date().required(),
  statusId: Joi.number().required(),
  employee: Joi.number().required(),
  service: Joi.number().required(),
});
export { Schedule, scheduleSchema };
