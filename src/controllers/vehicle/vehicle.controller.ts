import { Context } from 'koa';
import { body, query, request, summary, tagsAll } from 'koa-swagger-decorator';
import winston from 'winston';
import Response from '../../responses/response.handler';
import { responseCodeEnums } from '../../enums/responseCodeEnums';
import { VehicleRepository } from '../../repositories/vehicle.repository';
import { vehicleSchema } from '../../entities/vehicle';
@tagsAll(['Vehicle'])
export default class VehicleController {
  @request('post', '/vehicle')
  @summary('Create Vehicle')
  @body({
    service: { type: 'number', required: true },
  })
  public static async createVehicle(ctx: Context) {
    try {
      await vehicleSchema.validateAsync(ctx.request.body);
      const body = ctx.request.body;
      const vehicle = await VehicleRepository.createOrUpdateVehicle(body);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Vehicle created successfully',
        vehicle,
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

  @request('get', '/vehicles')
  @summary('Get Vehicles')
  @query({
    current: { type: 'number', required: false },
    pageSize: { type: 'number', required: false },
    queryString: { type: 'string', required: false },
  })
  public static async getVehicles(ctx: Context) {
    try {
      const query = ctx.request.query;
      const current = +query.current;
      const pageSize = +query.pageSize;
      const queryString = query.queryString as string;
      const [vehicles, count] = await VehicleRepository.list({
        current,
        pageSize,
        queryString,
      });
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Vehicles fetched successfully',
        { res: vehicles, count, current, pageSize },
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
