import { config } from '../config';
import { getSMSAPI, ISMSParams, sendSMSAPI } from '../utils/sms.crud';
import { BadRequestError } from '../errors/badRequestError';
import dayjs from 'dayjs';

export default class SMSUtil {
  public static async sendSMS({
    dst,
    message,
  }: {
    dst: number;
    message: string;
  }): Promise<string> {
    try {
      const params: ISMSParams = {
        api_username: config.smsUsername,
        api_password: config.smsPassword,
        method: 'sendMMS',
        did: config.smsDID,
        dst: process.env.NODE_ENV !== 'development' ? dst : 7323221555,
        message: message,
      };
      const res = await sendSMSAPI(params);
      if (res.data.status === 'success') {
        console.log(`SMS Sent to ${dst}`);
        return res.data;
      } else {
        throw new BadRequestError(res.data);
      }
    } catch (e) {
      throw new BadRequestError(e.message);
    }
  }
  public static async getConversation({
    contact,
    from = dayjs().subtract(2, 'months').format('YYYY-MM-DD'),
  }: {
    contact: number;
    from?: string;
  }): Promise<any[]> {
    try {
      const params = {
        api_username: config.smsUsername,
        api_password: config.smsPassword,
        method: 'getMMS',
        did: config.smsDID,
        contact: contact,
        from: from,
        all_messages: 1,
      };
      const res = await getSMSAPI(params);
      const data = res.data;
      if (data.status === 'success') {
        return data.sms;
      } else return [];
    } catch (e) {
      throw new BadRequestError(e);
    }
  }
  public static async getAllSMS({
    from = dayjs().subtract(90, 'days').format('YYYY-MM-DD'),
    contact,
  }: {
    from?: string;
    contact?: string;
  }): Promise<any[]> {
    try {
      const params = {
        api_username: config.smsUsername,
        api_password: config.smsPassword,
        method: 'getMMS',
        did: config.smsDID,
        from: from,
        all_messages: 1,
        limit: 100,
        ...(contact ? { contact: contact } : {}),
      };
      const res = await getSMSAPI(params);
      const data = res.data;
      if (data.status === 'success') {
        return data.sms;
      } else return [];
    } catch (e) {
      throw new BadRequestError(e);
    }
  }
}
