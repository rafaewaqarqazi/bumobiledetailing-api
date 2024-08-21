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
import { AddOnCategoryRepository } from '../../repositories/addOn.category.repository';
import { addOnCategorySchema } from '../../entities/addOn.category';
import Joi from 'joi';
@tagsAll(['AddOnCategory'])
export default class AddOnCategoryController {
  @request('post', '/addOnCategory')
  @summary('Create AddOnCategory')
  @body({
    addOnCategory: { type: 'number', required: true },
  })
  public static async createAddOnCategory(ctx: Context) {
    try {
      await addOnCategorySchema.validateAsync(ctx.request.body);
      const body = ctx.request.body;
      const addOnCategory =
        await AddOnCategoryRepository.createAddOnCategory(body);

      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'AddOnCategory created successfully',
        addOnCategory,
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
  @request('get', '/addOnCategory/list')
  @summary('Get All AddOnCategories')
  @query({
    current: { type: 'number', required: false },
    pageSize: { type: 'number', required: false },
    queryString: { type: 'string', required: false },
  })
  public static async getAllAddOnCategories(ctx: Context) {
    try {
      const query = ctx.request.query;
      const current = +query.current;
      const pageSize = +query.pageSize;
      const queryString = query.queryString as string;
      const [addOnCategories, count] = await AddOnCategoryRepository.list({
        current,
        pageSize,
        queryString,
      });
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'AddOnCategories retrieved successfully',
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
  @request('put', '/addOnCategory')
  @summary('Update AddOnCategory')
  @body({
    id: { type: 'number', required: true },
    name: { type: 'string', required: false },
    description: { type: 'string', required: false },
  })
  public static async updateAddOnCategory(ctx: Context) {
    try {
      const body = ctx.request.body;
      const addOnCategory =
        await AddOnCategoryRepository.updateAddOnCategory(body);

      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'AddOnCategory updated successfully',
        addOnCategory,
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
  @request('get', '/addOnCategory/{id}')
  @summary('Get AddOnCategory by ID')
  @path({
    id: { type: 'number', required: true },
  })
  public static async getAddOnCategoryById(ctx: Context) {
    try {
      const id = +ctx.params['id'];
      await Joi.number().required().validateAsync(id);
      const addOnCategory = await AddOnCategoryRepository.one(id);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'AddOnCategory retrieved successfully',
        addOnCategory,
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

  @request('delete', '/addOnCategory/{id}')
  @summary('Delete AddOnCategory')
  @path({
    id: { type: 'number', required: true },
  })
  public static async deleteAddOnCategory(ctx: Context) {
    try {
      const id = +ctx.params['id'];
      await AddOnCategoryRepository.deleteAddOnCategory(id);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'AddOnCategory deleted successfully',
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
