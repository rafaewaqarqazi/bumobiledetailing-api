import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BaseEntity,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import Joi from 'joi';
import { Service } from './service';
import { Customer } from './customer';
import { Vehicle } from './vehicle';
import { Schedule } from './schedule';
import { ServiceAssignment } from './service.assignment';
import { Payment } from './payment';
import { Package } from './package';
import { CustomerAddOn } from './customer.addOn';
@Entity()
class CustomerService extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: false })
  statusId: number;

  @ManyToOne(() => Customer, (customer) => customer.customerServices, {
    onDelete: 'CASCADE',
  })
  customer: Customer;

  @ManyToOne(() => Service, (service) => service.id, {
    onDelete: 'CASCADE',
  })
  service: Service;

  @ManyToOne(() => Package, (_package) => _package.id, {
    onDelete: 'CASCADE',
  })
  package: Package;

  @OneToMany(
    () => CustomerAddOn,
    (customerAddOn) => customerAddOn.customerService,
  )
  customerAddOns: CustomerAddOn[];

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.customerServices, {
    onDelete: 'CASCADE',
  })
  vehicle: Vehicle;

  @OneToOne(() => Schedule, (schedule) => schedule.customerService)
  @JoinColumn()
  schedule: Schedule;

  @OneToMany(() => Payment, (payment) => payment.customerService, {
    onDelete: 'CASCADE',
  })
  payments: Payment[];

  @OneToMany(
    () => ServiceAssignment,
    (serviceAssignment) => serviceAssignment.customerService,
    {
      onDelete: 'CASCADE',
    },
  )
  serviceAssignments: ServiceAssignment[];

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
const customerServiceSchema = Joi.object({
  startAt: Joi.date().required(),
  endAt: Joi.date().required(),
  statusId: Joi.number().required(),
  customer: Joi.number().required(),
  service: Joi.number().required(),
  vehicle: Joi.number().required(),
});
export { CustomerService, customerServiceSchema };
