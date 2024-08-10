import jwt from 'jsonwebtoken';
import { Context } from 'koa';
import { config } from '../config';
import { CustomerRepository } from '../repositories/customer.repository';
import { responseCodeEnums } from '../enums/responseCodeEnums';
import Response from '../responses/response.handler';
import { Roles } from '../enums/roles';
import { AdminRepository } from '../repositories/admin.repository';

export const jwtAuth = async (ctx: Context, next: any) => {
  if (!ctx.header.authorization) {
    return new Response(ctx, responseCodeEnums.UN_AUTHORIZED, 'Auth Missing');
  }
  try {
    const decoded: any = await jwt.verify(
      ctx.header.authorization,
      config.secret
    );
    if (decoded) {
      const repo = decoded.role === Roles.CUSTOMER ? CustomerRepository: AdminRepository;
      const res = await repo.findOne({
        where: {
          id: decoded.id,
        },
      });
      if (!res) {
        return new Response(
          ctx,
          responseCodeEnums.UN_AUTHORIZED,
          'Auth Missing'
        );
      }
      ctx.state.user = res;
      return next();
    } else {
      return new Response(ctx, responseCodeEnums.UN_AUTHORIZED, 'Auth Missing');
    }
  } catch (err) {
    return new Response(
      ctx,
      responseCodeEnums.UN_AUTHORIZED,
      'Auth token expired',
      err
    );
  }
};
