import { Context } from 'koa';
import { body, path, request, summary, tagsAll } from 'koa-swagger-decorator';
import winston from 'winston';
import Response from '../../responses/response.handler';
import { responseCodeEnums } from '../../enums/responseCodeEnums';
import { PackageAddOnsRepository } from '../../repositories/package.addOns.repository';
import Joi from 'joi';
@tagsAll(['PackageAddOn'])
export default class PackageAddOnController {
  @request('post', '/packageAddOn')
  @summary('Create PackageAddOns')
  @body({
    packageAddOns: { type: 'number', required: true },
  })
  public static async createPackageAddOn(ctx: Context) {
    try {
      await Joi.object({
        packageAddOns: Joi.array()
          .items(
            Joi.object({
              package: Joi.number().required(),
              service: Joi.number().required(),
            }),
          )
          .required(),
      }).validateAsync(ctx.request.body);
      const body = ctx.request.body;
      const _packageAddOns = await PackageAddOnsRepository.createPackageAddOns(
        body.packageAddOns,
      );

      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'PackageAddOn created successfully',
        _packageAddOns,
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
  @request('delete', '/packageAddOn/{id}')
  @summary('Delete PackageAddOn')
  @path({
    id: { type: 'number', required: true },
  })
  public static async deletePackageAddOn(ctx: Context) {
    try {
      const id = +ctx.params['id'];
      await PackageAddOnsRepository.deletePackageAddOn(id);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'PackageAddOn deleted successfully',
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
