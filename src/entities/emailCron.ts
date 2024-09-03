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
import { EmailCronTypeEnums } from '../enums/emailCronTypeEnums';
import { Coupon } from './coupon';
import { getESTTime } from '../utils/helpers';
import { Campaign } from './campaign';
import { Customer } from './customer';
@Entity()
class EmailCron extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => Customer, (customer) => customer.id, { onDelete: 'CASCADE' })
  student: Customer;

  @ManyToOne(() => Campaign, (campaign) => campaign.emailCron)
  campaign: Campaign;

  @Column({ nullable: false })
  interval: string;

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

  @Column({ nullable: true })
  type: EmailCronTypeEnums;

  @ManyToOne(() => Coupon, (coupon) => coupon.id)
  coupon: Coupon;

  @Column({ type: 'json', nullable: true })
  details: any;

  @Column({ nullable: true, type: 'longtext' })
  errorLog: string;

  // Generic Fields
  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ nullable: true, type: 'datetime', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ nullable: true, type: 'datetime', default: () => 'NOW()' })
  updatedAt: Date;

  @Column({
    nullable: true,
    type: 'datetime',
  })
  expiredAt: Date;

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

export { EmailCron };
