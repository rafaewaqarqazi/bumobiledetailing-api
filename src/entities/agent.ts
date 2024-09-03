import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeUpdate,
  BeforeInsert,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import { AgentEnums } from '../enums/agentEnums';
import { statusEnums } from '../enums/statusEnums';
import { Coupon } from './coupon';

@Entity()
class Agent extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  type: AgentEnums;

  @Column({ nullable: false, type: 'longtext' })
  prompt: string;

  @Column({ nullable: false, default: statusEnums.ACTIVE })
  statusId: statusEnums;

  @Column({ nullable: true, type: 'longtext' })
  emailSubjectFormat: string;

  @ManyToOne(() => Coupon, (coupon) => coupon.id, { onDelete: 'CASCADE' })
  coupon: Coupon;

  // Generic Fields
  @Column({
    type: 'datetime',
    default: () => 'NOW()',
  })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'NOW()',
  })
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

export { Agent };
