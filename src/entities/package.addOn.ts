import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeUpdate,
  BeforeInsert,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import Joi from 'joi';
import { Package } from './package';
import { AddOn } from './addOn';
@Entity()
class PackageAddOn extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: true })
  rank: number;

  @ManyToOne(() => Package, (_package) => _package.packageAddOns, {
    onDelete: 'CASCADE',
  })
  package: Package;

  @ManyToOne(() => AddOn, (addOn) => addOn.id, {
    onDelete: 'CASCADE',
  })
  addOn: AddOn;

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
const packageAddOnSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.string().required(),
  package: Joi.number().required(),
});
export { PackageAddOn, packageAddOnSchema };
