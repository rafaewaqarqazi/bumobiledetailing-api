import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import { getESTTime } from '../utils/helpers';
import { SMSConversation } from './smsConversation';

@Entity()
class SmsMessages extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: false })
  to: string;

  @Column({ nullable: false })
  from: string;

  @Column({ nullable: false, type: 'longtext' })
  message: string;

  @Column({ nullable: false, default: false })
  seen: boolean;

  @ManyToOne(() => SMSConversation, (smsConversation) => smsConversation.id, {
    onDelete: 'CASCADE',
  })
  smsConversation: SMSConversation;
  // Generic Fields
  @Column({ nullable: true, type: 'datetime', default: () => 'NOW()' })
  createdAt: Date;

  @BeforeInsert()
  beforeinsert() {
    this.createdAt = getESTTime();
  }
}

export { SmsMessages };
