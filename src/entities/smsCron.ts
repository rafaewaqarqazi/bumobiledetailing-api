import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BaseEntity,
  DeleteDateColumn,
  ManyToOne,
  BeforeUpdate,
} from 'typeorm';
import { getESTTime } from '../utils/helpers';
import { Campaign } from './campaign';
import { Customer } from './customer';
@Entity()
class SMSCron extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => Customer, (customer) => customer.id, { onDelete: 'CASCADE' })
  customer: Customer;

  @Column({ nullable: false })
  interval: string;

  @Column({ nullable: false, type: 'date' })
  date: Date;

  @Column({ nullable: false })
  statusId: number;

  @Column({ nullable: true, default: false })
  clicked: boolean;

  @Column({ nullable: true, default: false })
  purchase: boolean;

  @Column({ nullable: true, default: false })
  failed: boolean;

  @Column({ nullable: true, default: false })
  stopped: boolean;

  @Column({ type: 'json', nullable: true })
  details: any;

  @ManyToOne(() => Campaign, (campaign) => campaign.smsCron)
  campaign: Campaign;

  // Generic Fields
  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ nullable: true, type: 'datetime', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ nullable: true, type: 'datetime', default: () => 'NOW()' })
  updatedAt: Date;

  // typeORM listeners (HOOKS)
  @BeforeInsert()
  beforeinsert() {
    this.createdAt = getESTTime();
  }

  @BeforeUpdate()
  beforeupdate() {
    this.updatedAt = getESTTime();
  }
}

export { SMSCron };
