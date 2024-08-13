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
import { Quote } from './quote';
import { Service } from './service';
@Entity()
class QuoteService extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: false })
  amount: string;

  @ManyToOne(() => Quote, (quote) => quote.id, {
    onDelete: 'CASCADE',
  })
  quote: Quote;

  @ManyToOne(() => Service, (service) => service.id, {
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
const quoteServiceSchema = Joi.object({
  amount: Joi.string().required(),
  quote: Joi.number().required(),
  service: Joi.number().required(),
});
export { QuoteService, quoteServiceSchema };
