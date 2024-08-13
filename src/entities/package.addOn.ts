import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeUpdate,
  BeforeInsert,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import Joi from 'joi';
import { Package } from './package';
import { ServiceAddOn } from './service.addOn';
@Entity()
class PackageAddOn extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  price: string;

  @ManyToOne(() => Package, (_package) => _package.packageAddOns, {
    onDelete: 'CASCADE',
  })
  package: Package;

  @OneToMany(() => ServiceAddOn, (serviceAddOn) => serviceAddOn.packageAddOn)
  serviceAddOns: ServiceAddOn[];

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
