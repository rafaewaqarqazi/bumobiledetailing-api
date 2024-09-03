import { AppDataSource } from '../connection';
import { SmsMessages } from '../entities/smsMessages';
import { BadRequestError } from '../errors/badRequestError';

export const SmsMessageRepository = AppDataSource.getRepository(
  SmsMessages,
).extend({
  async createSmsMessage(
    smsMessageObj: Partial<SmsMessages>,
  ): Promise<SmsMessages> {
    const smsMessage: SmsMessages = await this.save(smsMessageObj);
    if (!smsMessage) {
      throw new BadRequestError('Could not save smsMessage');
    }
    return smsMessage;
  },

  async listFrom({
    fromDate,
    smsConversationId,
  }: {
    smsConversationId: number;
    fromDate: string;
  }): Promise<[SmsMessages[], number]> {
    const query = this.createQueryBuilder('smsMessages')
      .where('smsMessages.smsConversation = :smsConversationId', {
        smsConversationId,
      })
      .andWhere('Date(smsMessages.createdAt) >= :fromDate', { fromDate })
      .orderBy('smsMessages.createdAt', 'ASC');

    return await query.getManyAndCount();
  },

  async listByConversationId(id: number): Promise<SmsMessages[]> {
    if (!id) {
      return [];
    }
    return await this.find({
      where: {
        smsConversation: id,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  },
});
