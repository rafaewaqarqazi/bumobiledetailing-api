import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeUpdate,
  BeforeInsert,
  BaseEntity,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import Joi from 'joi';
import { EmployeePositions } from '../enums/employeePositions';
import { ServiceAssignment } from './service.assignment';
import { Schedule } from './schedule';
@Entity()
class Employee extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: false, select: false })
  password: string;

  @Column({ nullable: true })
  position: EmployeePositions;

  @Column({ nullable: false })
  statusId: number;

  @Column({ nullable: true, type: 'datetime' })
  passResetAt: Date;

  @OneToMany(
    () => ServiceAssignment,
    (serviceAssignment) => serviceAssignment.employee,
  )
  serviceAssignments: ServiceAssignment[];

  @OneToMany(() => Schedule, (schedule) => schedule.employee)
  schedules: Schedule[];

  // Generic Fields
  @Column({ nullable: true, type: 'datetime', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ nullable: true, type: 'datetime', default: () => 'NOW()' })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true, type: 'datetime' })
  deletedAt: Date;
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
const employeeSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  password: Joi.string().allow(null, ''),
  position: Joi.string().required(),
});
export { Employee, employeeSchema };
