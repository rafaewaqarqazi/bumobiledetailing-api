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
import { Customer } from './customer';
import { Vehicle } from './vehicle';
@Entity()
class Quote extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: false, type: 'datetime' })
  quoteDate: Date;

  @Column({ nullable: false })
  quotedAmount: string;

  @Column({ nullable: false })
  statusId: number;

  @ManyToOne(() => Customer, (customer) => customer.quotes, {
    onDelete: 'CASCADE',
  })
  customer: Customer;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.quotes, {
    onDelete: 'CASCADE',
  })
  vehicle: Vehicle;

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
const quoteSchema = Joi.object({
  quoteDate: Joi.date().required(),
  quotedAmount: Joi.string().required(),
  statusId: Joi.number().required(),
});
export { Quote, quoteSchema };
