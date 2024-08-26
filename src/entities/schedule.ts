import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BaseEntity,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import Joi from 'joi';
import { Employee } from './employee';
import { CustomerService } from './customer.service';
import { Timeslot } from './timeslot';
import { statusEnums } from '../enums/statusEnums';
import { Customer } from './customer';
@Entity()
class Schedule extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: true, type: 'datetime' })
  startAt: Date;

  @Column({ nullable: true, type: 'datetime' })
  endAt: Date;

  @Column({ nullable: false, type: 'date' })
  date: Date;

  @Column({ nullable: false, default: statusEnums.ACTIVE })
  statusId: number;

  @ManyToOne(() => Customer, (customer) => customer.schedules, {
    onDelete: 'CASCADE',
  })
  customer: Customer;

  @ManyToOne(() => Employee, (employee) => employee.schedules, {
    onDelete: 'CASCADE',
  })
  employee: Employee;

  @OneToOne(
    () => CustomerService,
    (customerService) => customerService.schedule,
    {
      onDelete: 'CASCADE',
    },
  )
  customerService: CustomerService;

  @ManyToOne(() => Timeslot, (timeslot) => timeslot.schedules, {
    onDelete: 'CASCADE',
  })
  timeslot: Timeslot;

  // Generic Fields
  @Column({ nullable: true, type: 'datetime', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ nullable: true, type: 'datetime', default: () => 'NOW()' })
  updatedAt: Date;

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
