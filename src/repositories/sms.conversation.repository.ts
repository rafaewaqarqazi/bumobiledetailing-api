import { AppDataSource } from '../connection';
import { SMSConversation } from '../entities/smsConversation';
import { BadRequestError } from '../errors/badRequestError';
import { config } from '../config';
import { statusEnums } from '../enums/statusEnums';
import { sanitizePhoneNumber } from '../utils/helpers';

export const SmsConversationRepository = AppDataSource.getRepository(
  SMSConversation,
).extend({
  async createSMSConversation(
    smsConversationObj: Partial<SMSConversation>,
  ): Promise<SMSConversation> {
    const smsConversation: SMSConversation =
      await this.save(smsConversationObj);
    if (!smsConversation) {
      throw new BadRequestError('Could not save smsConversation');
    }

    return smsConversation;
  },
  async createOrUpdate(
    smsConversationObj: Partial<SMSConversation>,
  ): Promise<SMSConversation> {
    smsConversationObj.contact = sanitizePhoneNumber(
      smsConversationObj.contact,
    );
    const smsConversation = await this.findOne({
      where: {
        contact: smsConversationObj.contact,
      },
    });
    if (smsConversation) {
      smsConversation.updatedAt = new Date();
      this.merge(smsConversation, smsConversationObj);
      return await smsConversation.save();
    }
    return await this.createSMSConversation(smsConversationObj);
  },
  async updateSMSConversation(
    smsConversationObj: SMSConversation,
  ): Promise<SMSConversation> {
    if (!SMSConversation.hasId(smsConversationObj))
      throw new BadRequestError('SMSConversation id not provided');
    const smsConversation: SMSConversation = await this.findOne({
      where: { id: smsConversationObj.id },
    });
    if (!smsConversation) {
      throw new BadRequestError('Could not update smsConversation');
    }
    this.merge(smsConversation, smsConversationObj);
    await smsConversation.save();
    return smsConversation;
  },
  async list({
    query_string,
    isTest,
    pageNo,
    perPage,
  }: {
    query_string?: string;
    isTest?: boolean;
    pageNo?: number;
    perPage?: number;
  }): Promise<[SMSConversation[], number]> {
    const count = await this.query(`SELECT
    COUNT(distinct sms_conversation.id) as count
    FROM ${config.dbName}.sms_conversation sms_conversation
    LEFT JOIN customer cst ON sms_conversation.customerId = cst.id AND cst.deletedAt IS NULL
    WHERE sms_conversation.test IS ${isTest ? 'NOT' : ''} NULL
    ${
      query_string
        ? `AND (cst.email LIKE '%${query_string}%' OR cst.phone like '%${query_string}%')`
        : ''
    }
    `);
    const res = await this.query(`SELECT
sms_conversation.*,
cst.id as customerId,
cst.firstName,
cst.lastName,
cst.email,
cst.phone,
cst.createdAt customerCreatedAt,
cstSer.id as customerServiceId,
cstSer.statusId as customerServiceStatusId,
cstSer.createdAt customerServiceCreatedAt,
GROUP_CONCAT(CONCAT(vh.year, ' ', vh.make, ' ', vh.model)) as vehicleName,
COUNT(CASE WHEN (smsMsg.seen = 0 OR smsMsg.seen is null) THEN smsMsg.id END) as unreadCount
 FROM ${config.dbName}.sms_conversation sms_conversation
LEFT JOIN customer cst ON sms_conversation.customerId = cst.id AND cst.deletedAt IS NULL
LEFT JOIN customer_service cstSer ON cst.id = cstSer.customerId AND cstSer.statusId NOT IN (${
      statusEnums.ARCHIVE
    }, ${statusEnums.CANCELLED})
LEFT JOIN vehicle vh ON cst.id = vh.customerId
LEFT JOIN sms_messages smsMsg ON sms_conversation.id = smsMsg.smsConversationId

WHERE sms_conversation.test IS ${isTest ? 'NOT' : ''} NULL
${
  query_string
    ? `AND (cst.email LIKE '%${query_string}%' OR cst.phone like '%${query_string}%')`
    : ''
}

GROUP BY sms_conversation.id
ORDER BY unreadCount DESC, sms_conversation.updatedAt DESC
${perPage ? `LIMIT ${perPage} OFFSET ${(pageNo - 1) * perPage}` : ''}
`);
    return [res, count[0].count];
  },

  async oneByPhone(phone: string): Promise<SMSConversation> {
    return await this.createQueryBuilder('smsConversation')
      .where('smsConversation.contact = :phone', { phone })
      .andWhere('smsConversation.did = :did', { did: config.smsDID })
      .leftJoinAndSelect('smsConversation.customer', 'customer')
      .leftJoinAndSelect('smsConversation.smsCron', 'smsCron')
      .leftJoinAndSelect('smsCron.campaign', 'campaign')
      .leftJoinAndSelect('campaign.followUpCampaign', 'followUpCampaign')
      .leftJoinAndSelect('smsConversation.smsMessages', 'smsMessages')
      .leftJoinAndSelect('smsConversation.agent', 'agent')
      .leftJoinAndSelect('agent.coupon', 'coupon')
      .orderBy('smsConversation.updatedAt', 'DESC')
      .getOne();
  },
  async agentActivation(
    id: number,
    isAgentActive: boolean,
  ): Promise<SMSConversation> {
    const smsConversation = await this.findOne({
      where: { id },
    });
    if (!smsConversation) {
      throw new BadRequestError('Could not update smsConversation');
    }
    smsConversation.isAgentActive = isAgentActive;
    await smsConversation.save();
    return smsConversation;
  },
});
