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
import { Customer, customerSchema } from '../../entities/customer';
import { CustomerRepository } from '../../repositories/customer.repository';
import Joi from 'joi';
import { VehicleRepository } from '../../repositories/vehicle.repository';
import { CustomerServiceRepository } from '../../repositories/customer.service.repository';
import dayjs from 'dayjs';
import { statusEnums } from '../../enums/statusEnums';
@tagsAll(['Customer'])
export default class CustomerController {
  @request('post', '/customer')
  @summary('Create Customer')
  @body({
    firstName: { type: 'string', required: true },
    lastName: { type: 'string', required: true },
    email: { type: 'string', required: true },
    phone: { type: 'string', required: true },
    address: { type: 'string', required: false },
    city: { type: 'string', required: false },
    state: { type: 'string', required: false },
    zipCode: { type: 'string', required: false },
    country: { type: 'string', required: false },
  })
  public static async createCustomer(ctx: Context) {
    try {
      await customerSchema.validateAsync(ctx.request.body);
      const body = ctx.request.body as Customer;
      const user = await CustomerRepository.createCustomer(body);
      // const html = await readHTMLFile(
      //   nPath.join(
      //     nPath.resolve(),
      //     'src',
      //     'templates',
      //     'customer-registration-email-template.html',
      //   ),
      // );
      // const template = handlebars.compile(html);
      // const replacements = {
      //   name: titleCase(user.firstName),
      //   email: user.email,
      //   password: body.password,
      //   loginURL: `${config.frontendURL}/auth/login-customer`,
      // };
      // const htmlToSend = template(replacements);
      // sendEmail({
      //   from: config.smtpEmail,
      //   to: user.email,
      //   subject: 'BU Mobile Detailing | Customer Registration',
      //   html: htmlToSend,
      // });
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Customer created successfully',
        user,
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
  @request('post', '/customer/intent')
  @summary('Save Intent Customer')
  @body({
    email: { type: 'string', required: true },
  })
  public static async saveIntentCustomer(ctx: Context) {
    try {
      await Joi.object({
        email: Joi.string().email().allow(null, ''),
        name: Joi.string().allow(null, ''),
        phone: Joi.string().allow(null, ''),
      }).validateAsync(ctx.request.body);
      const body = ctx.request.body;
      const name = body.name?.split(' ');
      const firstName = name?.[0];
      const lastName = name?.[1];
      body.firstName = firstName;
      body.lastName = lastName;
      if (!body.phone && !body.email) {
        return new Response(
          ctx,
          responseCodeEnums.BAD_REQUEST,
          'Phone number or email is required',
          null,
        );
      }
      const user = await CustomerRepository.createCustomer(body);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Customer created successfully',
        user,
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
  @request('post', '/customer/old')
  @summary('Save Old Customer')
  @body({
    firstName: { type: 'string', required: true },
    lastName: { type: 'string', required: true },
    phone: { type: 'string', required: true },
    vehicle: { type: 'string', required: true },
    serviceDate: { type: 'string', required: true },
  })
  public static async saveOldCustomer(ctx: Context) {
    try {
      await Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().allow(null, ''),
        phone: Joi.string().allow(null, ''),
        vehicle: Joi.string().required(),
        type: Joi.string().required(),
        serviceDate: Joi.string().required(),
      }).validateAsync(ctx.request.body);
      const body = ctx.request.body;
      const user = await CustomerRepository.createCustomer({
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
      });
      const make = body.vehicle?.split(' ')[0];
      const model = body.vehicle?.split(' ')[1];
      const vehicle = await VehicleRepository.createOrUpdateVehicle({
        make,
        model,
        customer: user,
        type: body.type,
      });
      await CustomerServiceRepository.createOrUpdate({
        vehicle,
        createdAt: dayjs(body.serviceDate, 'MM/DD/YY').toDate(),
        updatedAt: dayjs(body.serviceDate, 'MM/DD/YY').toDate(),
        customer: user,
        statusId: statusEnums.ACTIVE,
      });
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Customer created successfully',
        user,
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
  @request('get', '/customers')
  @summary('Get All Customers')
  @query({
    current: { type: 'number', required: false },
    pageSize: { type: 'number', required: false },
    queryString: { type: 'string', required: false },
  })
  public static async getAllCustomers(ctx: Context) {
    try {
      const query = ctx.request.query;
      const current = +query.current;
      const pageSize = +query.pageSize;
      const queryString = query.queryString as string;
      const statusId = +query.statusId;
      const [customers, count] = await CustomerRepository.list({
        current,
        pageSize,
        queryString,
        statusId,
      });
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Customers retrieved successfully',
        { res: customers, count, current, pageSize },
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
  @request('put', '/customer')
  @summary('Update Customer')
  @body({
    id: { type: 'number', required: true },
    firstName: { type: 'string', required: false },
    lastName: { type: 'string', required: false },
    email: { type: 'string', required: false },
    phone: { type: 'string', required: false },
    address: { type: 'string', required: false },
    city: { type: 'string', required: false },
    state: { type: 'string', required: false },
    zipCode: { type: 'string', required: false },
    country: { type: 'string', required: false },
    statusId: { type: 'number', required: false },
  })
  public static async updateCustomer(ctx: Context) {
    try {
      const body = ctx.request.body as Customer;
      const customer = await CustomerRepository.updateCustomer(body);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Customer updated successfully',
        customer,
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
  @request('get', '/customer/{id}')
  @summary('Get Customer By Id')
  @path({
    id: { type: 'number', required: true },
  })
  public static async getCustomerById(ctx: Context) {
    try {
      const id = +ctx.params['id'];
      const customer = await CustomerRepository.one(id);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Customer retrieved successfully',
        customer,
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
  @request('delete', '/customer/{id}')
  @summary('Delete Customer')
  @path({
    id: { type: 'number', required: true },
  })
  public static async deleteCustomer(ctx: Context) {
    try {
      const id = +ctx.params['id'];
      await CustomerRepository.deleteCustomer(id);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Customer deleted successfully',
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
