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
import { CouponRepository } from '../../repositories/coupon.repository';
import { couponSchema } from '../../entities/coupon';
import Joi from 'joi';
@tagsAll(['Coupon'])
export default class CouponController {
  @request('post', '/coupon')
  @summary('Create Coupon')
  @body({
    code: { type: 'string', required: true },
    discountAmount: { type: 'number', required: false },
    discountPercentage: { type: 'number', required: false },
    startAt: { type: 'string', required: true },
    endAt: { type: 'string', required: true },
  })
  public static async createCoupon(ctx: Context) {
    try {
      await couponSchema.validateAsync(ctx.request.body);
      const body = ctx.request.body;
      const coupon = await CouponRepository.createOrUpdateCoupon(body);

      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Coupon created successfully',
        coupon,
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
  @request('put', '/coupon')
  @summary('Update Coupon')
  @body({
    id: { type: 'number', required: true },
    code: { type: 'string', required: true },
    discountAmount: { type: 'number', required: false },
    discountPercentage: { type: 'number', required: false },
    startAt: { type: 'string', required: true },
    endAt: { type: 'string', required: true },
  })
  public static async updateCoupon(ctx: Context) {
    try {
      const body = ctx.request.body;
      const coupon = await CouponRepository.updateCoupon(body);

      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Coupon updated successfully',
        coupon,
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

  @request('get', '/coupons')
  @summary('Get All Coupons')
  @query({
    current: { type: 'number', required: false },
    pageSize: { type: 'number', required: false },
    queryString: { type: 'string', required: false },
    withAllRelations: { type: 'boolean', required: false },
  })
  public static async getAllCoupons(ctx: Context) {
    try {
      const query = ctx.request.query;
      const current = +query.current;
      const pageSize = +query.pageSize;
      const queryString = query.queryString as string;
      const [coupons, count] = await CouponRepository.list({
        current,
        pageSize,
        queryString,
      });
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Coupons retrieved successfully',
        { res: coupons, count, current, pageSize },
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

  @request('get', '/coupon/{id}')
  @summary('Get Coupon by ID')
  @path({
    id: { type: 'number', required: true },
  })
  public static async getCouponById(ctx: Context) {
    try {
      const id = +ctx.params['id'];
      await Joi.number().required().validateAsync(id);
      const coupon = await CouponRepository.one(id);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Coupon retrieved successfully',
        coupon,
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

  @request('delete', '/coupon/{id}')
  @summary('Delete Coupon')
  @path({
    id: { type: 'number', required: true },
  })
  public static async deleteCoupon(ctx: Context) {
    try {
      const id = +ctx.params['id'];
      await CouponRepository.deleteCoupon(id);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Coupon deleted successfully',
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
  @request('get', '/coupon/code/{code}')
  @summary('Get Coupon by Code')
  @path({
    code: { type: 'string', required: true },
  })
  public static async getCouponByCode(ctx: Context) {
    try {
      const code = ctx.params['code'];
      await Joi.string().required().validateAsync(code);
      const coupon = await CouponRepository.getByCode(code);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Coupon retrieved successfully',
        coupon,
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
