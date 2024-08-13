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
import { Payment } from './payment';
@Entity()
class CreditCard extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: false })
  cardType: string;

  @Column({ nullable: false })
  last4Digits: string;

  @Column({ nullable: false })
  expiry: string;

  @ManyToOne(() => Customer, (customer) => customer.creditCards, {
    onDelete: 'CASCADE',
  })
  customer: Customer;

  @OneToMany(() => Payment, (payment) => payment.creditCard)
  payments: Payment[];

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
const creditCardSchema = Joi.object({
  cardType: Joi.string().required(),
  last4Digits: Joi.string().required(),
  expiry: Joi.string().required(),
  customer: Joi.number().required(),
});
export { CreditCard, creditCardSchema };
