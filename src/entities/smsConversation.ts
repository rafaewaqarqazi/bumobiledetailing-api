import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  ManyToOne,
  BeforeUpdate,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { getESTTime } from '../utils/helpers';
import { SmsMessages } from './smsMessages';
import { Customer } from './customer';
import { SMSCron } from './smsCron';
import { Agent } from './agent';

@Entity()
class SMSConversation extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: false })
  contact: string;

  @Column({ nullable: false })
  did: string;

  @Column({ nullable: false, type: 'longtext' })
  lastMessage: string;

  @Column({ nullable: true, type: 'json' })
  test: object;

  @Column({ nullable: true, default: true })
  isAgentActive: boolean;

  // Associations
  @ManyToOne(() => Customer, (customer) => customer.id, { onDelete: 'CASCADE' })
  customer: Customer;

  @ManyToOne(() => SMSCron, (smsCron) => smsCron.id)
  smsCron: SMSCron;

  @OneToMany(() => SmsMessages, (smsMessages) => smsMessages.smsConversation)
  smsMessages: SmsMessages[];

  @ManyToOne(() => Agent, (agent) => agent.id)
  agent: Agent;

  // Generic Fields
  @Column({ nullable: true, type: 'datetime', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ nullable: true, type: 'datetime', default: () => 'NOW()' })
  updatedAt: Date;

  @BeforeInsert()
  beforeinsert() {
    this.createdAt = getESTTime();
  }
  @BeforeUpdate()
  beforeupdate() {
    this.updatedAt = getESTTime();
  }
}

export { SMSConversation };
