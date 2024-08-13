import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import Joi from 'joi';
import { Customer } from './customer';
@Entity()
class Referral extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: false })
  statusId: number;

  @ManyToOne(() => Customer, (customer) => customer.referrals, {
    onDelete: 'CASCADE',
  })
  customer: Customer;

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
const referralSchema = Joi.object({
  statusId: Joi.number().required(),
  customer: Joi.number().required(),
});
export { Referral, referralSchema };
