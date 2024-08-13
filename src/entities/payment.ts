import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import Joi from 'joi';
import { Service } from './service';
import { CreditCard } from './creditCard';
@Entity()
class Payment extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: false })
  amountPaid: string;

  @Column({ nullable: false, type: 'datetime' })
  paidAt: Date;

  @Column({ nullable: false })
  statusId: number;

  @ManyToOne(() => Service, (service) => service.payments, {
    onDelete: 'CASCADE',
  })
  service: Service;

  @ManyToOne(() => CreditCard, (creditCard) => creditCard.payments, {
    onDelete: 'CASCADE',
  })
  creditCard: CreditCard;

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
const paymentSchema = Joi.object({
  amountPaid: Joi.string().required(),
  paidAt: Joi.date().required(),
  statusId: Joi.number().required(),
  service: Joi.number().required(),
  creditCard: Joi.number().required(),
});
export { Payment, paymentSchema };
