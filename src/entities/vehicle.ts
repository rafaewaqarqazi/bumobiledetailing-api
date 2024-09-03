import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeUpdate,
  BeforeInsert,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import Joi from 'joi';
import { Customer } from './customer';
import { CustomerService } from './customer.service';
@Entity()
class Vehicle extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: true })
  make: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  year: number;

  @Column({ nullable: true })
  vin: string;

  @Column({ nullable: true })
  licensePlate: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: false })
  type: string;

  @ManyToOne(() => Customer, (customer) => customer.vehicles, {
    onDelete: 'CASCADE',
  })
  customer: Customer;

  @OneToMany(
    () => CustomerService,
    (customerService) => customerService.vehicle,
  )
  customerServices: CustomerService[];

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
const vehicleSchema = Joi.object({
  make: Joi.string().required(),
  model: Joi.string().required(),
  year: Joi.number().required(),
  vin: Joi.string(),
  licensePlate: Joi.string(),
  color: Joi.string(),
  customer: Joi.number().required(),
  type: Joi.string().required(),
});
export { Vehicle, vehicleSchema };
