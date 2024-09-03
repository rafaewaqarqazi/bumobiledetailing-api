import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeUpdate,
  BeforeInsert,
  BaseEntity,
  OneToMany,
  OneToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import Joi from 'joi';
import { Vehicle } from './vehicle';
import { Quote } from './quote';
import { CreditCard } from './creditCard';
import { Feedback } from './feedback';
import { Referral } from './referral';
import { Preferences } from './customerPreferences';
import { CustomerService } from './customer.service';
import { CustomerAddOn } from './customer.addOn';
import { Schedule } from './schedule';
import { SMSConversation } from './smsConversation';
import { EmailMessage } from './emailMessage';
@Entity()
class Customer extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true, unique: true })
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

  @OneToMany(
    () => CustomerService,
    (customerService) => customerService.customer,
  )
  customerServices: CustomerService[];

  @OneToMany(() => CustomerAddOn, (customerAddOn) => customerAddOn.customer)
  customerAddOns: CustomerAddOn[];

  @OneToMany(() => Quote, (quote) => quote.customer)
  quotes: Quote[];

  @OneToMany(() => CreditCard, (creditCard) => creditCard.customer)
  creditCards: CreditCard[];

  @OneToMany(() => Feedback, (feedback) => feedback.customer)
  feedbacks: Feedback[];

  @OneToMany(
    () => SMSConversation,
    (smsConversation) => smsConversation.customer,
  )
  smsConversations: SMSConversation[];

  @OneToMany(() => EmailMessage, (emailMessage) => emailMessage.customer)
  emailMessages: EmailMessage[];

  @OneToMany(() => Referral, (referral) => referral.customer)
  referrals: Referral[];

  @OneToMany(() => Schedule, (schedule) => schedule.customer)
  schedules: Schedule[];

  @OneToOne(() => Preferences)
  @JoinColumn()
  preferences: Preferences;

  // Generic Fields
  @Column({ nullable: true, type: 'datetime', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ nullable: true, type: 'datetime', default: () => 'NOW()' })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true, type: 'datetime' })
  deletedAt: Date;

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
  country: Joi.string(),
  zipCode: Joi.string(),
  password: Joi.string(),
  preferences: Joi.object(),
});
export { Customer, customerSchema };
