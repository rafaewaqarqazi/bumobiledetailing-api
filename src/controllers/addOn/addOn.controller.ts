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
import { AddOnRepository } from '../../repositories/addOn.repository';
import { addOnSchema } from '../../entities/addOn';
import Joi from 'joi';
@tagsAll(['AddOn'])
export default class AddOnController {
  @request('post', '/addOn')
  @summary('Create AddOn')
  @body({
    addOn: { type: 'number', required: true },
  })
  public static async createAddOn(ctx: Context) {
    try {
      await addOnSchema.validateAsync(ctx.request.body);
      const body = ctx.request.body;
      const addOn = await AddOnRepository.createAddOn(body);

      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'AddOn created successfully',
        addOn,
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
  @request('get', '/addOn/list')
  @summary('Get All AddOns')
  @query({
    current: { type: 'number', required: false },
    pageSize: { type: 'number', required: false },
    queryString: { type: 'string', required: false },
  })
  public static async getAllAddOns(ctx: Context) {
    try {
      const query = ctx.request.query;
      const current = +query.current;
      const pageSize = +query.pageSize;
      const queryString = query.queryString as string;
      const [addOnCategories, count] = await AddOnRepository.list({
        current,
        pageSize,
        queryString,
      });
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'AddOns retrieved successfully',
        { res: addOnCategories, count, current, pageSize },
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
  @request('put', '/addOn')
  @summary('Update AddOn')
  @body({
    id: { type: 'number', required: true },
    name: { type: 'string', required: false },
    description: { type: 'string', required: false },
  })
  public static async updateAddOn(ctx: Context) {
    try {
      const body = ctx.request.body;
      const addOn = await AddOnRepository.updateAddOn(body);

      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'AddOn updated successfully',
        addOn,
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
  @request('get', '/addOn/{id}')
  @summary('Get AddOn by ID')
  @path({
    id: { type: 'number', required: true },
  })
  public static async getAddOnById(ctx: Context) {
    try {
      const id = +ctx.params['id'];
      await Joi.number().required().validateAsync(id);
      const addOn = await AddOnRepository.one(id);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'AddOn retrieved successfully',
        addOn,
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

  @request('delete', '/addOn/{id}')
  @summary('Delete AddOn')
  @path({
    id: { type: 'number', required: true },
  })
  public static async deleteAddOn(ctx: Context) {
    try {
      const id = +ctx.params['id'];
      await AddOnRepository.deleteAddOn(id);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'AddOn deleted successfully',
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
