import { Context } from 'koa';
import {
  body,
  path,
  query,
  request,
  summary,
  tagsAll,
} from 'koa-swagger-decorator';
import Response from '../../responses/response.handler';
import winston from 'winston';
import { responseCodeEnums } from '../../enums/responseCodeEnums';
import Joi from 'joi';
import { AgentRepository } from '../../repositories/agent.repository';
import { AgentEnums } from '../../enums/agentEnums';

@tagsAll(['Agent'])
export default class AgentController {
  @request('get', '/agents')
  @summary('Get All Agents')
  @query({
    queryString: { type: 'string', required: false },
    pageNo: { type: 'number', required: false },
    perPage: { type: 'number', required: false },
    type: { type: 'string', required: false },
  })
  public static async getAll(ctx: Context) {
    try {
      await Joi.object({
        queryString: Joi.string().allow(null, ''),
        current: Joi.number(),
        pageSize: Joi.number(),
        type: Joi.string().allow(null, ''),
      }).validateAsync(ctx.request.query);

      const current = +ctx.request.query.current || 1;
      const pageSize = +ctx.request.query.pageSize || 10;
      const queryString = ctx.request.query.queryString as string;
      const type = ctx.request.query.type as AgentEnums;

      const [agent, count] = await AgentRepository.list({
        queryString: queryString,
        current: current,
        pageSize: pageSize,
        type: type,
      });
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Agent fetched successfully!',
        { res: agent, current, pageSize, count: count },
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
  @request('post', '/agent')
  @summary('Create Agent')
  @body({
    name: { type: 'string', required: true },
    prompt: { type: 'string', required: false },
    coupon: { type: 'number', required: false },
    statusId: { type: 'number', required: false },
    emailSubjectFormat: { type: 'string', required: false },
  })
  public static async createAgent(ctx: Context) {
    try {
      await Joi.object({
        name: Joi.string(),
        prompt: Joi.string(),
        coupon: Joi.number(),
        statusId: Joi.number(),
        emailSubjectFormat: Joi.string().allow(null, ''),
        type: Joi.string(),
      }).validateAsync(ctx.request.body);

      const agent = await AgentRepository.createOrUpdate(ctx.request.body);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Agent created successfully!',
        agent,
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
  @request('put', '/agent')
  @summary('Update Agent')
  @body({
    name: { type: 'string', required: true },
    prompt: { type: 'string', required: false },
    coupon: { type: 'number', required: false },
    statusId: { type: 'number', required: false },
    id: { type: 'number', required: true },
    emailSubjectFormat: { type: 'string', required: false },
  })
  public static async updateAgent(ctx: Context) {
    try {
      await Joi.object({
        name: Joi.string(),
        prompt: Joi.string(),
        coupon: Joi.number(),
        statusId: Joi.number(),
        id: Joi.number().required(),
        emailSubjectFormat: Joi.string().allow(null, ''),
      }).validateAsync(ctx.request.body);

      const agent = await AgentRepository.updateAgent(ctx.request.body);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Agent updated successfully!',
        agent,
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
  @request('post', '/agent/duplicate/{id}')
  @summary('Duplicate Agent')
  @path({
    id: { type: 'number', required: true },
  })
  public static async duplicateAgent(ctx: Context) {
    try {
      await Joi.object({
        id: Joi.number().required(),
      }).validateAsync(ctx.params);

      const agent = await AgentRepository.duplicateAgent(ctx.params['id']);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Agent duplicated successfully!',
        agent,
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
  @request('GET', '/agent/{type}/{name}')
  @summary('Get Agent By Type and Name')
  @path({
    type: { type: 'string', required: true },
    name: { type: 'string', required: true },
  })
  public static async getAgentByTypeAndName(ctx: Context) {
    try {
      await Joi.object({
        type: Joi.string().required(),
        name: Joi.string().required(),
      }).validateAsync(ctx.params);

      const agent = await AgentRepository.findByTypeAndName(ctx.params);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Agent fetched successfully!',
        agent,
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

  @request('delete', '/agent/{id}')
  @summary('Delete Agent')
  @path({
    id: { type: 'number', required: true },
  })
  public static async deleteAgent(ctx: Context) {
    try {
      await Joi.object({
        id: Joi.number().required(),
      }).validateAsync(ctx.params);

      const agent = await AgentRepository.deleteAgent(ctx.params['id']);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Agent deleted successfully!',
        agent,
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
}
