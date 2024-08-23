import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import Joi from 'joi';
import { AddOn } from './addOn';
import { Customer } from './customer';
import { CustomerService } from './customer.service';
@Entity()
class CustomerAddOn extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: false })
  quantity: number;

  @Column({ nullable: false })
  statusId: number;

  @ManyToOne(() => Customer, (customer) => customer.customerAddOns, {
    onDelete: 'CASCADE',
  })
  customer: Customer;

  @OneToMany(
    () => CustomerService,
    (customerService) => customerService.customerAddOns,
    {
      onDelete: 'CASCADE',
    },
  )
  customerService: CustomerService;

  @ManyToOne(() => AddOn, (addOn) => addOn.id, {
    onDelete: 'CASCADE',
  })
  addOn: AddOn;

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
const customerAddOnSchema = Joi.object({
  startAt: Joi.date().required(),
  endAt: Joi.date().required(),
  statusId: Joi.number().required(),
  customer: Joi.number().required(),
  service: Joi.number().required(),
  vehicle: Joi.number().required(),
});
export { CustomerAddOn, customerAddOnSchema };
