import { Context } from 'koa';
import { responseCodeEnums } from '../enums/responseCodeEnums';
import Response from '../responses/response.handler';
import { Roles } from '../enums/roles';

export const customerAuth = async (ctx: Context, next: any) => {
  if (!ctx.state.user) {
    return new Response(ctx, responseCodeEnums.UN_AUTHORIZED, 'Token Missing');
  }

  if (ctx.state.user.role !== Roles.CUSTOMER) {
    return new Response(
      ctx,
      responseCodeEnums.UN_AUTHORIZED,
      'Not authorized!'
    );
  }

  return next();
};
