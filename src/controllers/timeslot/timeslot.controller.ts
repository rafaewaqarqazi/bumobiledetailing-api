import { Context } from 'koa';
import {
  body,
  path,
  query,
  request,
  summary,
  tagsAll,
} from 'koa-swagger-decorator';
import winston from 'winston';
import Response from '../../responses/response.handler';
import { responseCodeEnums } from '../../enums/responseCodeEnums';
import { TimeslotRepository } from '../../repositories/timeslot.repository';
import { timeslotSchema } from '../../entities/timeslot';
import Joi from 'joi';
@tagsAll(['Timeslot'])
export default class TimeslotController {
  @request('post', '/timeslot')
  @summary('Create Timeslot')
  @body({
    timeslot: { type: 'number', required: true },
  })
  public static async createTimeslot(ctx: Context) {
    try {
      await timeslotSchema.validateAsync(ctx.request.body);
      const body = ctx.request.body;
      const timeslot = await TimeslotRepository.createTimeslot(body);

      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Timeslot created successfully',
        timeslot,
      );
    } catch (err) {
      winston.log('error', `400 - ${ctx?.request?.url} - ${err}`);
      return new Response(
        ctx,
        responseCodeEnums.BAD_REQUEST,
        err.message || 'Something went wrong',
        err,
      );
    }
  }
  @request('get', '/timeslots')
  @summary('Get All Timeslots')
  @query({
    current: { type: 'number', required: false },
    pageSize: { type: 'number', required: false },
    queryString: { type: 'string', required: false },
  })
  public static async getAllTimeslots(ctx: Context) {
    try {
      const query = ctx.request.query;
      const current = +query.current;
      const pageSize = +query.pageSize;
      const queryString = query.queryString as string;
      const [timeslots, count] = await TimeslotRepository.list({
        current,
        pageSize,
        queryString,
      });
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'AddOnCategories retrieved successfully',
        { res: timeslots, count, current, pageSize },
      );
    } catch (err) {
      winston.log('error', `400 - ${ctx?.request?.url} - ${err}`);
      return new Response(
        ctx,
        responseCodeEnums.BAD_REQUEST,
        err.message || 'Something went wrong',
        err,
      );
    }
  }

  @request('get', '/timeslot/date/{date}')
  @summary('Get Timeslots by Date')
  @path({
    date: { type: 'string', required: true },
  })
  public static async getTimeslotsByDate(ctx: Context) {
    try {
      const date = ctx.params['date'];
      await Joi.string().required().validateAsync(date);
      const timeslots = await TimeslotRepository.getTimeslotsByDate(date);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Timeslots retrieved successfully',
        timeslots,
      );
    } catch (err) {
      winston.log('error', `400 - ${ctx?.request?.url} - ${err}`);
      return new Response(
        ctx,
        responseCodeEnums.BAD_REQUEST,
        err.message || 'Something went wrong',
        err,
      );
    }
  }

  @request('put', '/timeslot')
  @summary('Update Timeslot')
  @body({
    id: { type: 'number', required: true },
    time: { type: 'string', required: true },
    days: { type: 'string', required: true },
  })
  public static async updateTimeslot(ctx: Context) {
    try {
      const body = ctx.request.body;
      const timeslot = await TimeslotRepository.updateTimeslot(body);

      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Timeslot updated successfully',
        timeslot,
      );
    } catch (err) {
      winston.log('error', `400 - ${ctx?.request?.url} - ${err}`);
      return new Response(
        ctx,
        responseCodeEnums.BAD_REQUEST,
        err.message || 'Something went wrong',
        err,
      );
    }
  }
  @request('get', '/timeslot/{id}')
  @summary('Get Timeslot by ID')
  @path({
    id: { type: 'number', required: true },
  })
  public static async getTimeslotById(ctx: Context) {
    try {
      const id = +ctx.params['id'];
      await Joi.number().required().validateAsync(id);
      const timeslot = await TimeslotRepository.one(id);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Timeslot retrieved successfully',
        timeslot,
      );
    } catch (err) {
      winston.log('error', `400 - ${ctx?.request?.url} - ${err}`);
      return new Response(
        ctx,
        responseCodeEnums.BAD_REQUEST,
        err.message || 'Something went wrong',
        err,
      );
    }
  }

  @request('delete', '/timeslot/{id}')
  @summary('Delete Timeslot')
  @path({
    id: { type: 'number', required: true },
  })
  public static async deleteTimeslot(ctx: Context) {
    try {
      const id = +ctx.params['id'];
      await TimeslotRepository.deleteTimeslot(id);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Timeslot deleted successfully',
        id,
      );
    } catch (err) {
      winston.log('error', `400 - ${ctx?.request?.url} - ${err}`);
      return new Response(
        ctx,
        responseCodeEnums.BAD_REQUEST,
        err.message || 'Something went wrong',
        err,
      );
    }
  }
}
