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
import { Service } from './service';
import { Quote } from './quote';
@Entity()
class Vehicle extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: false })
  make: string;

  @Column({ nullable: false })
  model: string;

  @Column({ nullable: false })
  year: number;

  @Column({ nullable: false })
  vin: string;

  @Column({ nullable: false })
  licensePlate: string;

  @Column({ nullable: false })
  color: string;

  @ManyToOne(() => Customer, (customer) => customer.vehicles, {
    onDelete: 'CASCADE',
  })
  customer: Customer;

  @OneToMany(() => Service, (service) => service.vehicle)
  services: Service[];

  @OneToMany(() => Quote, (quote) => quote.vehicle)
  quotes: Quote[];

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
  vin: Joi.string().required(),
  licensePlate: Joi.string().required(),
  color: Joi.string().required(),
  customerId: Joi.number().required(),
});
export { Vehicle, vehicleSchema };
