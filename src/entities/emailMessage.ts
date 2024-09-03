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
import { EmailCron } from './emailCron';
@Entity()
class EmailMessage extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: false, type: 'longtext' })
  message: string;

  @Column({ nullable: false })
  subject: string;

  @Column({ nullable: false })
  statusId: number;

  @ManyToOne(() => Customer, (customer) => customer.emailMessages, {
    onDelete: 'CASCADE',
  })
  customer: Customer;

  @ManyToOne(() => EmailCron, (emailCron) => emailCron.id)
  emailCron: EmailCron;
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
const emailMessageSchema = Joi.object({
  message: Joi.string().required(),
  subject: Joi.string().required(),
  statusId: Joi.number().required(),
  customer: Joi.number().required(),
  emailCron: Joi.number(),
});
export { EmailMessage, emailMessageSchema };
