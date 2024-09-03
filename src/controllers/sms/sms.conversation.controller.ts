import { Context } from 'koa';
import {
  body,
  request,
  summary,
  tagsAll,
  query,
  path,
} from 'koa-swagger-decorator';
import Joi from 'joi';
import Response from '../../responses/response.handler';
import winston from 'winston';
import { responseCodeEnums } from '../../enums/responseCodeEnums';
import { config } from '../../config';
import {
  currencyFormatter,
  getESTTime,
  sanitizePhoneNumber,
  sanitizeSMSAgentPrompt,
  sleep,
  titleCase,
} from '../../utils/helpers';
import { OpenAIService } from '../../services/openai.service';
import { AgentRepository } from '../../repositories/agent.repository';
import { SmsConversationRepository } from '../../repositories/sms.conversation.repository';
import console from 'node:console';
import { Readable } from 'stream';
import { SmsMessageRepository } from '../../repositories/sms.message.repository';
import SMSUtil from '../../services/sms.service';
import { CustomerRepository } from '../../repositories/customer.repository';
import { io } from '../../../index';
import { SmsCronRepository } from '../../repositories/sms.cron.repository';
import { statusEnums } from '../../enums/statusEnums';
import OpenAI from 'openai';
@tagsAll(['SMSConversation'])
export default class SmsConversationController {
  @request('get', '/conversation')
  @summary('Get SMS List in Conversation')
  @query({
    id: { type: 'number', required: false },
  })
  public static async findConversation(ctx: Context) {
    try {
      await Joi.object({
        id: Joi.number().optional(),
        contact: Joi.number().optional(),
      }).validateAsync(ctx.request.query);
      let id = +ctx.request.query.id;
      const contact = +ctx.request.query.contact;

      let conversation = null;
      if (id) {
        conversation = await SmsConversationRepository.findOne({
          where: {
            id: id,
          },
        });
      }
      if (contact) {
        const conv = await SmsConversationRepository.findOne({
          where: {
            contact: `${contact}`,
          },
          order: {
            updatedAt: 'DESC',
          },
        });
        if (conv) {
          id = conv.id;
          conversation = conv;
        }
      }
      const customer = await CustomerRepository.findOne({
        where: {
          phone: contact ? `${contact}` : conversation?.contact,
        },
      });
      const res = await SmsMessageRepository.listByConversationId(id);
      if (!res.length) {
        const messages = await SMSUtil.getConversation({ contact });
        if (!messages.length) {
          return new Response(
            ctx,
            responseCodeEnums.BAD_REQUEST,
            'Conversation not found!',
          );
        }
        const newConversation = await SmsConversationRepository.createOrUpdate({
          contact: `${contact}`,
          did: `${config.smsDID}`,
          lastMessage: messages[messages.length - 1].message,
          customer,
        });
        for (const message of messages) {
          await SmsMessageRepository.createSmsMessage({
            message: message.message,
            from: message.type === '1' ? `${contact}` : `${config.smsDID}`,
            to: message.type === '1' ? `${config.smsDID}` : `${contact}`,
            smsConversation: newConversation,
          });
        }
        const newRes = await SmsMessageRepository.listByConversationId(
          newConversation.id,
        );
        return new Response(
          ctx,
          responseCodeEnums.SUCCESS,
          'Conversation Retrieved',
          { res: newRes, conversation: newConversation },
        );
      }
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Conversation Retrieved',
        { res, conversation: conversation },
      );
    } catch (err) {
      winston.log('error', `400 - ${ctx?.request?.url} - ${err}`);
      return new Response(
        ctx,
        responseCodeEnums.BAD_REQUEST,
        'Something went wrong!',
        err,
      );
    }
  }
  @request('post', '/conversation')
  @summary('Create SMS Conversation')
  @body({
    contact: { type: 'number', required: true },
    customer: { type: 'number', required: true },
  })
  public static async createSMSConversation(ctx: Context) {
    try {
      await Joi.object({
        contact: Joi.string().required(),
        customer: Joi.number().required(),
        lastMessage: Joi.string().required(),
        agent: Joi.number().optional().allow(null),
      }).validateAsync(ctx.request.body);

      const res = await SmsConversationRepository.createOrUpdate({
        ...ctx.request.body,
        did: config.smsDID,
      });

      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'SMS Conversation created successfully!',
        res,
      );
    } catch (err) {
      winston.log('error', `400 - ${ctx?.request?.url} - ${err}`);
      return new Response(
        ctx,
        responseCodeEnums.BAD_REQUEST,
        'Something went wrong!',
        err,
      );
    }
  }
  @request('post', '/conversation/test')
  @summary('Create SMS Conversation')
  @body({
    contact: { type: 'number', required: true },
    name: { type: 'string', required: true },
    expiredAt: { type: 'string', required: true },
    moduleName: { type: 'string', required: true },
    agentId: { type: 'number', required: true },
  })
  public static async createTestSMSConversation(ctx: Context) {
    try {
      await Joi.object({
        contact: Joi.string().required(),
        name: Joi.string().required(),
        vehicleName: Joi.string().required(),
        agentId: Joi.number().required(),
      }).validateAsync(ctx.request.body);

      const body = ctx.request.body;

      const agent = await AgentRepository.oneById(body.agentId);
      let prompt = sanitizeSMSAgentPrompt(agent.prompt, {
        coupon: agent.coupon,
      });

      prompt = `${prompt}
      User Details:
      \`\`\`
name: ${titleCase(`${body?.name}`)},
vehicle: ${body?.vehicleName},
coupon_code: ${agent?.coupon.code},
discount: ${agent?.coupon.discountPercentage ? `${agent?.coupon.discountPercentage}%` : currencyFormatter.format(Number(agent?.coupon.discountAmount || 0))}
\`\`\``;
      const agentResponse = await OpenAIService.smsAgent({
        prompt,
      });
      const res = await SmsConversationRepository.createSMSConversation({
        contact: sanitizePhoneNumber(body.contact),
        test: {
          name: body.name,
          expiredAt: body.expiredAt,
          moduleName: body.moduleName,
        },
        did: `${config.smsDID}`,
        lastMessage: agentResponse,
        agent,
      });
      await SmsMessageRepository.createSmsMessage({
        smsConversation: res,
        from: `${config.smsDID}`,
        to: sanitizePhoneNumber(body.contact),
        message: agentResponse,
        seen: true,
      });
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Test SMS Conversation created successfully!',
        res,
      );
    } catch (err) {
      winston.log('error', `400 - ${ctx?.request?.url} - ${err}`);
      return new Response(
        ctx,
        responseCodeEnums.BAD_REQUEST,
        'Something went wrong!',
        err,
      );
    }
  }

  @request('put', '/conversation')
  @summary('Update SMS Conversation')
  @body({
    id: { type: 'number', required: true },
    lastMessage: { type: 'string', required: true },
  })
  public static async updateSMSConversation(ctx: Context) {
    try {
      await Joi.object({
        id: Joi.number().required(),
        lastMessage: Joi.string().required(),
        agent: Joi.number().optional().allow(null),
      }).validateAsync(ctx.request.body);

      const res = await SmsConversationRepository.updateSMSConversation(
        ctx.request.body,
      );

      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'SMS Conversation created successfully!',
        res,
      );
    } catch (err) {
      winston.log('error', `400 - ${ctx?.request?.url} - ${err}`);
      return new Response(
        ctx,
        responseCodeEnums.BAD_REQUEST,
        'Something went wrong!',
        err,
      );
    }
  }

  @request('get', '/conversations')
  @summary('Get SMS Conversation list')
  @query({
    q: { type: 'string', required: false },
  })
  public static async listSMSConversation(ctx: Context) {
    try {
      const query_string = ctx.request.query.q as string;
      const pageNo = +ctx.request.query.pageNo;
      const perPage = +ctx.request.query.perPage;
      const isTest = ctx.request.query.isTest === 'true';

      const [res, count] = await SmsConversationRepository.list({
        query_string: query_string,
        pageNo,
        perPage,
        isTest,
      });
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Conversation Retrieved',
        { res: res, pageNo, perPage, totalCount: count },
      );
    } catch (err) {
      winston.log('error', `400 - ${ctx?.request?.url} - ${err}`);
      return new Response(
        ctx,
        responseCodeEnums.BAD_REQUEST,
        'Something went wrong!',
        err,
      );
    }
  }
  @request('put', '/conversation/agent/activation/{id}')
  @summary('Update Agent Activation')
  @path({
    id: { type: 'number', required: true },
  })
  @body({
    isAgentActive: { type: 'boolean', required: true },
  })
  public static async updateAgentActivation(ctx: Context) {
    try {
      await Joi.number().required().validateAsync(ctx.params['id']);
      const body = ctx.request.body;
      await Joi.object({
        isAgentActive: Joi.boolean().required(),
      }).validateAsync(body);

      const res = await SmsConversationRepository.agentActivation(
        +ctx.params['id'],
        body.isAgentActive,
      );

      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Agent Activation updated successfully!',
        res,
      );
    } catch (err) {
      winston.log('error', `400 - ${ctx?.request?.url} - ${err}`);
      return new Response(
        ctx,
        responseCodeEnums.BAD_REQUEST,
        'Something went wrong!',
        err,
      );
    }
  }

  //   SMS
  @request('post', '/sms')
  @summary('Send SMS')
  @body({
    dst: { type: 'number', required: true },
    message: { type: 'string', required: true },
  })
  public static async sendSMS(ctx: Context) {
    try {
      const body = ctx.request.body;
      await Joi.object({
        dst: Joi.number().required(),
        message: Joi.string().required(),
        test: Joi.boolean().optional(),
        conversationId: Joi.number().optional(),
      }).validateAsync(body);
      let newMsg = null;
      if (body.conversationId) {
        newMsg = await SmsMessageRepository.createSmsMessage({
          message: body.message,
          from: `${config.smsDID}`,
          to: body.dst,
          smsConversation: body.conversationId,
          seen: true,
        });
      }
      io?.to(body.conversationId)?.emit('sms', {
        conversationId: body.conversationId,
        id: newMsg?.id,
        to: body.dst,
        from: `${config.smsDID}`,
        message: body.message,
      });

      if (!config.DEV && !body.test) {
        const res = await SMSUtil.sendSMS(ctx.request.body);
        return new Response(
          ctx,
          responseCodeEnums.SUCCESS,
          'SMS sent successfully!',
          res,
        );
      }
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'SMS sent successfully!',
        {
          id: newMsg?.id,
          to: body.dst,
          from: `${config.smsDID}`,
          message: body.message,
        },
      );
    } catch (err) {
      winston.log('error', `400 - ${ctx?.request?.url} - ${err}`);
      return new Response(
        ctx,
        responseCodeEnums.BAD_REQUEST,
        'Something went wrong!',
        err,
      );
    }
  }

  @request('get', '/sms/callback')
  @summary('SMS Callback')
  public static async smsCallback(ctx: Context) {
    try {
      const query = ctx.request.query;
      const to = query.to as string;
      const from = query.from as string;
      const message = query.message as string;
      const id = query.id as string;
      const conversation = await SmsConversationRepository.oneByPhone(from);
      if (!conversation) {
        return new Response(
          ctx,
          responseCodeEnums.BAD_REQUEST,
          'conversation not found!',
          {
            to,
            from,
            message,
            id,
          },
        );
      }

      if (!conversation.test) {
        await SmsCronRepository.save({
          id: conversation.smsCron.id,
          clicked: true,
        });
      }

      const customer = conversation?.customer;

      const smsMessages = conversation.smsMessages;
      const userMsg = await SmsMessageRepository.createSmsMessage({
        smsConversation: conversation,
        message,
        from,
        to,
        seen: !!conversation.test,
      });
      await SmsConversationRepository.save({
        id: conversation.id,
        lastMessage: message,
        updatedAt: getESTTime(),
      });
      io?.to(conversation.id)?.emit('sms', {
        conversationId: conversation.id,
        id: userMsg.id,
        to: `${config.smsDID}`,
        from: from,
        message: message,
      });
      if (!conversation.test) {
        io?.emit('new-sms');
      }

      if (
        message?.toLowerCase()?.includes('stop') ||
        message?.toLowerCase()?.includes('unsub')
      ) {
        if (customer) {
          await CustomerRepository.save({
            id: customer.id,
            allowSMS: false,
          });
        }
      }

      const test = conversation?.test as any;
      const agent = conversation.agent;
      if (!agent) {
        return new Response(
          ctx,
          responseCodeEnums.BAD_REQUEST,
          'Agent not found!',
          {
            to,
            from,
            message,
            id,
          },
        );
      }
      if (
        agent?.statusId === statusEnums.IN_ACTIVE ||
        !conversation.isAgentActive
      ) {
        return new Response(
          ctx,
          responseCodeEnums.BAD_REQUEST,
          'Agent is inactive!',
          {
            to,
            from,
            message,
            id,
          },
        );
      }
      if (!conversation.test) {
        await sleep(1000 * 60);
      }
      const messages = smsMessages.map((msg) => ({
        role: msg.from === from ? 'user' : 'system',
        content: msg.message,
      }));

      let prompt = sanitizeSMSAgentPrompt(agent.prompt, {
        coupon: agent.coupon,
      });

      prompt = `${prompt}
      User Details:
      \`\`\`
name: ${titleCase(`${customer?.firstName || test?.name}`)},

discount: ${agent.coupon?.discountPercentage ? `${agent.coupon?.discountPercentage}%` : currencyFormatter.format(Number(agent.coupon?.discountAmount || 0))}
\`\`\``;
      const agentResponse = await OpenAIService.smsAgent({
        messages: messages as any,
        message,
        prompt,
      });
      const newMsg = await SmsMessageRepository.createSmsMessage({
        smsConversation: conversation,
        message: agentResponse,
        from: `${config.smsDID}`,
        to: from,
        seen: true,
      });
      try {
        await SmsConversationRepository.save({
          id: conversation.id,
          lastMessage: agentResponse,
          updatedAt: getESTTime(),
        });
        io?.to(conversation.id)?.emit('sms', {
          conversationId: conversation.id,
          id: newMsg.id,
          to: conversation.contact,
          from: `${config.smsDID}`,
          message: agentResponse,
        });

        if (!config.DEV && !test) {
          await SMSUtil.sendSMS({
            dst: Number(from),
            message: agentResponse,
          });
        } else {
          console.log('SMS AGENT-----> MESSAGE', agentResponse);
        }

        console.log(`SMS AGENT - SMS sent: to: ${from}`);
      } catch (err) {
        console.log(`SMS AGENT - Problem sending sms: ${err}`);
      }
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'SMS received successfully!',
        {
          to,
          from,
          message,
          id,
        },
      );
    } catch (err) {
      winston.log('error', `400 - ${ctx?.request?.url} - ${err}`);
      return new Response(
        ctx,
        responseCodeEnums.BAD_REQUEST,
        'Something went wrong!',
        err,
      );
    }
  }
  @request('post', '/sms/generate')
  @summary('Generate SMS')
  @body({
    studentId: { type: 'number', required: true },
    agentId: { type: 'number', required: true },
    studentModuleId: { type: 'number', required: true },
  })
  public static async generateSMS(ctx: Context) {
    try {
      const body = JSON.parse(ctx.request.body || '{}');
      await Joi.object({
        studentId: Joi.number().required(),
        agentId: Joi.number().required(),
        studentModuleId: Joi.number().required(),
        generatedMessage: Joi.string().optional().allow(null, ''),
        withSubject: Joi.boolean().optional().allow(null, ''),
      }).validateAsync(body);
      const customer = await CustomerRepository.one(body.studentId);
      const agent = await AgentRepository.oneById(body.agentId);

      const prompt = sanitizeSMSAgentPrompt(agent.prompt, {
        coupon: agent.coupon,
      });
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `${prompt}
      User Details:
      \`\`\`
name: ${titleCase(`${customer?.firstName}`)},

discount: ${agent.coupon?.discountPercentage ? `${agent.coupon?.discountPercentage}%` : currencyFormatter.format(Number(agent.coupon?.discountAmount || 0))}
\`\`\``,
        },
      ];
      if (body.generatedMessage && body.withSubject) {
        messages.push({ role: 'system', content: body.generatedMessage });
        messages.push({
          role: 'user',
          content: `Generate Subject line for this message, only subject text.${
            agent.emailSubjectFormat
              ? `
            Use this format: ${agent.emailSubjectFormat}`
              : ''
          }`,
        });
      }
      const res = OpenAIService.createStreamChatCompletion({
        messages: messages,
      });
      ctx.body = new Readable({
        read() {
          res.next().then((data) => {
            if (data.done) {
              this.push(null);
            } else {
              this.push(data.value);
            }
          });
        },
      });
    } catch (err) {
      winston.log('error', `400 - ${ctx?.request?.url} - ${err}`);
      return new Response(
        ctx,
        responseCodeEnums.BAD_REQUEST,
        'Something went wrong!',
        err,
      );
    }
  }
}
