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
import { ServiceRepository } from '../../repositories/service.repository';
import { serviceSchema } from '../../entities/service';
import Joi from 'joi';
import { ServicePackageRepository } from '../../repositories/service.package.repository';
@tagsAll(['Service'])
export default class ServiceController {
  @request('post', '/service')
  @summary('Create Service')
  @body({
    service: { type: 'number', required: true },
  })
  public static async createService(ctx: Context) {
    try {
      await serviceSchema.validateAsync(ctx.request.body);
      const body = ctx.request.body;
      const service = await ServiceRepository.createService(body);

      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Service created successfully',
        service,
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
  @request('get', '/services')
  @summary('Get All Services')
  @query({
    current: { type: 'number', required: false },
    pageSize: { type: 'number', required: false },
    queryString: { type: 'string', required: false },
    withAllRelations: { type: 'boolean', required: false },
  })
  public static async getAllServices(ctx: Context) {
    try {
      const query = ctx.request.query;
      const current = +query.current;
      const pageSize = +query.pageSize;
      const queryString = query.queryString as string;
      const withAllRelations = query.withAllRelations === 'true';
      const [serviceCategories, count] = await ServiceRepository.list({
        current,
        pageSize,
        queryString,
        withAllRelations,
      });
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Services retrieved successfully',
        { res: serviceCategories, count, current, pageSize },
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
  @request('put', '/service')
  @summary('Update Service')
  @body({
    id: { type: 'number', required: true },
    name: { type: 'string', required: false },
    description: { type: 'string', required: false },
  })
  public static async updateService(ctx: Context) {
    try {
      const body = ctx.request.body;
      const service = await ServiceRepository.updateService(body);

      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Service updated successfully',
        service,
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
  @request('get', '/service/{id}')
  @summary('Get Service by ID')
  @path({
    id: { type: 'number', required: true },
  })
  public static async getServiceById(ctx: Context) {
    try {
      const id = +ctx.params['id'];
      await Joi.number().required().validateAsync(id);
      const service = await ServiceRepository.one(id);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Service retrieved successfully',
        service,
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

  @request('delete', '/service/{id}')
  @summary('Delete Service')
  @path({
    id: { type: 'number', required: true },
  })
  public static async deleteService(ctx: Context) {
    try {
      const id = +ctx.params['id'];
      await ServiceRepository.deleteService(id);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Service deleted successfully',
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

  @request('put', '/service/package/{id}')
  @summary('Update Service Package')
  @path({
    id: { type: 'number', required: true },
  })
  @body({
    isPopular: { type: 'boolean', required: true },
  })
  public static async updateServicePackage(ctx: Context) {
    try {
      const id = +ctx.params['id'];
      await Joi.number().required().validateAsync(id);
      await Joi.boolean().required().validateAsync(ctx.request.body.isPopular);
      const servicePackage =
        await ServicePackageRepository.updateServicePackage(
          id,
          ctx.request.body,
        );
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Service Package updated successfully',
        servicePackage,
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
