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
import { Package, packageSchema } from '../../entities/package';
import { PackageRepository } from '../../repositories/package.repository';
@tagsAll(['Package'])
export default class PackageController {
  @request('post', '/package')
  @summary('Create Package')
  @body({
    name: { type: 'string', required: true },
    description: { type: 'string', required: true },
    price: { type: 'string', required: true },
  })
  public static async createPackage(ctx: Context) {
    try {
      await packageSchema.validateAsync(ctx.request.body);
      const body = ctx.request.body as Package;
      const _package = await PackageRepository.createPackage(body);

      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Package created successfully',
        _package,
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
  @request('get', '/packages')
  @summary('Get All Packages')
  @query({
    current: { type: 'number', required: false },
    pageSize: { type: 'number', required: false },
    queryString: { type: 'string', required: false },
  })
  public static async getAllPackages(ctx: Context) {
    try {
      const query = ctx.request.query;
      const current = +query.current;
      const pageSize = +query.pageSize;
      const queryString = query.queryString as string;
      const [packages, count] = await PackageRepository.list({
        current,
        pageSize,
        queryString,
      });
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Packages retrieved successfully',
        { res: packages, count, current, pageSize },
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
  @request('put', '/package')
  @summary('Update Package')
  @body({
    id: { type: 'number', required: true },
    name: { type: 'string', required: false },
    description: { type: 'string', required: false },
    price: { type: 'string', required: false },
  })
  public static async updatePackage(ctx: Context) {
    try {
      const body = ctx.request.body as Package;
      const _package = await PackageRepository.updatePackage(body);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Package updated successfully',
        _package,
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
  @request('get', '/package/{id}')
  @summary('Get Package By Id')
  @path({
    id: { type: 'number', required: true },
  })
  public static async getPackageById(ctx: Context) {
    try {
      const id = +ctx.params['id'];
      const _package = await PackageRepository.one(id);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Package retrieved successfully',
        _package,
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
  @request('delete', '/package/{id}')
  @summary('Delete Package')
  @path({
    id: { type: 'number', required: true },
  })
  public static async deletePackage(ctx: Context) {
    try {
      const id = +ctx.params['id'];
      await PackageRepository.deletePackage(id);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Package deleted successfully',
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
