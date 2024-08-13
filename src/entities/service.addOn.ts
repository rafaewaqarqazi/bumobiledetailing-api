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
import { PackageAddOn } from './package.addOn';
import { Service } from './service';
@Entity()
class ServiceAddOn extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => PackageAddOn, (packageAddOn) => packageAddOn.serviceAddOns, {
    onDelete: 'CASCADE',
  })
  packageAddOn: PackageAddOn;

  @ManyToOne(() => Service, (service) => service.serviceAddOns, {
    onDelete: 'CASCADE',
  })
  service: Service;

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
const serviceAddOnSchema = Joi.object({
  packageAddOn: Joi.number().required(),
  service: Joi.number().required(),
});
export { ServiceAddOn, serviceAddOnSchema };
