import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeUpdate,
  BeforeInsert,
  BaseEntity,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import Joi from 'joi';
import { Customer } from './customer';
import { Vehicle } from './vehicle';
import { ServiceCategory } from './service.category';
import { Quote } from './quote';
import { Package } from './package';
import { ServiceAddOn } from './service.addOn';
import { ServiceAssignment } from './service.assignment';
import { Payment } from './payment';
import { Feedback } from './feedback';
import { Schedule } from './schedule';
@Entity()
class Service extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: false })
  serviceType: string;

  @Column({ nullable: false, type: 'datetime' })
  serviceDate: Date;

  @Column({ nullable: false, type: 'datetime' })
  completionDate: Date;

  @Column({ nullable: false })
  quotedAmount: string;

  @ManyToOne(() => Customer, (customer) => customer.services, {
    onDelete: 'CASCADE',
  })
  customer: Customer;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.services, {
    onDelete: 'CASCADE',
  })
  vehicle: Vehicle;

  @OneToOne(() => ServiceCategory)
  @JoinColumn()
  serviceCategory: ServiceCategory;

  @OneToOne(() => Quote)
  @JoinColumn()
  quote: Quote;

  @OneToOne(() => Package)
  @JoinColumn()
  package: Package;

  @OneToMany(() => ServiceAddOn, (serviceAddOn) => serviceAddOn.service)
  serviceAddOns: ServiceAddOn[];

  @OneToMany(
    () => ServiceAssignment,
    (serviceAssignment) => serviceAssignment.service,
  )
  serviceAssignments: ServiceAssignment[];

  @OneToMany(() => Payment, (payment) => payment.service)
  payments: Payment[];

  @OneToMany(() => Feedback, (feedback) => feedback.service)
  feedbacks: Feedback[];

  @OneToMany(() => Schedule, (schedule) => schedule.service)
  schedules: Schedule[];

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
const serviceSchema = Joi.object({
  serviceType: Joi.string().required(),
  serviceDate: Joi.date().required(),
  completionDate: Joi.date().required(),
  quotedAmount: Joi.string().required(),
});
export { Service, serviceSchema };
