import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BaseEntity,
  BeforeUpdate,
} from 'typeorm';
import { getESTTime } from '../utils/helpers';

export enum PreferenceTypes {
  EMAIL = 'email',
  SMS = 'sms',
}
@Entity()
class Preferences extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: false })
  type: PreferenceTypes;

  @Column({ nullable: false, default: true })
  appointment: boolean;

  @Column({ nullable: false, default: true })
  marketing: boolean;

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

export { Preferences };
