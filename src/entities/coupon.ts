import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeUpdate,
  BeforeInsert,
  BaseEntity,
} from 'typeorm';
import Joi from 'joi';
@Entity()
class Coupon extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: false })
  code: string;

  @Column({ nullable: true })
  discountAmount: string;

  @Column({ nullable: true })
  discountPercentage: string;

  @Column({ nullable: false, type: 'datetime' })
  startAt: Date;

  @Column({ nullable: false, type: 'datetime' })
  endAt: Date;

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
const couponSchema = Joi.object({
  code: Joi.string().required(),
  discountAmount: Joi.number().allow(null, ''),
  discountPercentage: Joi.number().allow(null, ''),
  startAt: Joi.date().required(),
  endAt: Joi.date().required(),
});
export { Coupon, couponSchema };
