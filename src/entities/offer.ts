import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeUpdate,
  BeforeInsert,
  BaseEntity,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import Joi from 'joi';
import { Coupon } from './coupon';
@Entity()
class Offer extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false, type: 'datetime' })
  startAt: Date;

  @Column({ nullable: false, type: 'datetime' })
  endAt: Date;

  @OneToOne(() => Coupon)
  @JoinColumn()
  coupon: Coupon;

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
const offerSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  startAt: Joi.date().required(),
  endAt: Joi.date().required(),
  coupon: Joi.number().required(),
});
export { Offer, offerSchema };
