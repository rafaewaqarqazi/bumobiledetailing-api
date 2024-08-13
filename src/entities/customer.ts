import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeUpdate,
  BeforeInsert,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import Joi from 'joi';
import { Vehicle } from './vehicle';
import { Service } from './service';
import { Quote } from './quote';
import { CreditCard } from './creditCard';
import { Feedback } from './feedback';
import { TextMessage } from './textMessage';
import { Referral } from './referral';
@Entity()
class Customer extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: false, select: false })
  password: string;

  @Column({ nullable: true, type: 'longtext' })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: false })
  statusId: number;

  @Column({ nullable: true, type: 'datetime' })
  passResetAt: Date;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.customer)
  vehicles: Vehicle[];

  @OneToMany(() => Service, (service) => service.customer)
  services: Service[];

  @OneToMany(() => Quote, (quote) => quote.customer)
  quotes: Quote[];

  @OneToMany(() => CreditCard, (creditCard) => creditCard.customer)
  creditCards: CreditCard[];

  @OneToMany(() => Feedback, (feedback) => feedback.customer)
  feedbacks: Feedback[];

  @OneToMany(() => TextMessage, (textMessage) => textMessage.customer)
  textMessages: TextMessage[];

  @OneToMany(() => Referral, (referral) => referral.customer)
  referrals: Referral[];

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
const customerSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  address: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
  zipCode: Joi.string(),
  password: Joi.string(),
});
export { Customer, customerSchema };
