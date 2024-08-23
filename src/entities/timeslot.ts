import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import Joi from 'joi';
import { Schedule } from './schedule';
@Entity()
class Timeslot extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: false })
  time: string;

  @Column({ nullable: false })
  days: string;

  @OneToMany(() => Schedule, (schedule) => schedule.timeslot)
  schedules: Schedule[];

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
const timeslotSchema = Joi.object({
  time: Joi.string().required(),
  days: Joi.string().required(),
});
export { Timeslot, timeslotSchema };
