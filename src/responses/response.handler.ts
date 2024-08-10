// Predefined Services
import { BaseContext } from 'koa';
// Enums
import { responseCodeEnums } from '../enums/responseCodeEnums';

export default class Response {
  constructor(
    ctx: BaseContext,
    statusCode: number,
    message?: string,
    data?: any
  ) {
    if (
      statusCode != responseCodeEnums.SUCCESS &&
      statusCode != responseCodeEnums.BAD_REQUEST &&
      statusCode != responseCodeEnums.UN_AUTHORIZED &&
      statusCode != responseCodeEnums.FORBIDDEN &&
      statusCode != responseCodeEnums.NOT_FOUND &&
      statusCode != responseCodeEnums.NOT_ALLOWED &&
      statusCode != responseCodeEnums.NOT_ACCEPTABLE &&
      statusCode != responseCodeEnums.CONFLICT &&
      statusCode != responseCodeEnums.INTERNAL_SERVER_ERROR &&
      statusCode != responseCodeEnums.SERVER_UNAVAILABLE
    ) {
      ctx.status = responseCodeEnums.BAD_REQUEST;
      return (ctx.body = {
        statusCode: responseCodeEnums.BAD_REQUEST,
        message: 'Invalid StatusCode Selection',
        data: {},
      });
    }
    ctx.status = statusCode;
    return (ctx.body = {
      statusCode,
      message: message || '',
      data: data || undefined,
    });
  }
}
