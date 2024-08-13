import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BaseEntity,
  BeforeUpdate,
  Index,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { statusEnums } from '../enums/statusEnums';
import { CampaignType } from '../enums/campaignType';
import { Offer } from './offer';
interface ICampaignQueryFilters {}
export enum CampaignQueryEnums {}
@Entity()
class Campaign extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: false })
  type: CampaignType;

  @Index()
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false })
  time: string;

  @Column({ nullable: false })
  runEvery: string;

  @Column({ nullable: false })
  days: string;

  @Column({ nullable: false, default: statusEnums.ACTIVE })
  statusId: number;

  @Column({ nullable: true })
  query: CampaignQueryEnums;

  @Column({ nullable: true, type: 'json' })
  filters: ICampaignQueryFilters;

  @Column({ nullable: true })
  isFollowUp: boolean;

  @Column({ nullable: true, default: false })
  followUpHrs: number;

  @Column({ nullable: true, default: true })
  withHeaderLogo: boolean;

  @Column({ nullable: true, default: true })
  withFooter: boolean;

  @Column({ nullable: true })
  budget: string;

  @Column({ nullable: true })
  roi: string;

  @ManyToOne(() => Campaign, (campaign) => campaign.id, {
    onDelete: 'CASCADE',
  })
  followUpCampaign: Campaign;

  @OneToOne(() => Offer)
  @JoinColumn()
  offer: Offer;

  // Generic Fields
  @Column({ nullable: true, type: 'datetime', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ nullable: true, type: 'datetime', default: () => 'NOW()' })
  updatedAt: Date;

  @BeforeInsert()
  beforeinsert() {
    this.createdAt = new Date();
  }

  @BeforeUpdate()
  beforeupdate() {
    this.updatedAt = new Date();
  }
}

export { Campaign };
