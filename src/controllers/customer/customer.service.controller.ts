import { Context } from 'koa';
import { body, request, summary, tagsAll } from 'koa-swagger-decorator';
import winston from 'winston';
import Response from '../../responses/response.handler';
import { responseCodeEnums } from '../../enums/responseCodeEnums';
import Joi from 'joi';
import { CustomerServiceRepository } from '../../repositories/customer.service.repository';
import { statusEnums } from '../../enums/statusEnums';
import { ScheduleRepository } from '../../repositories/schedule.repository';
import { CustomerAddOnRepository } from '../../repositories/customer.addOn.repository';
import { CustomerRepository } from '../../repositories/customer.repository';
import { QuoteRepository } from '../../repositories/quote.repository';
@tagsAll(['CustomerService'])
export default class CustomerServiceController {
  @request('post', '/customer-service')
  @summary('Create Customer Service')
  @body({
    vehicle: { type: 'number', required: false },
    service: { type: 'number', required: false },
    package: { type: 'number', required: false },
    timeslot: { type: 'object', required: false },
    customer: { type: 'number', required: false },
    customerAddOns: { type: 'object', required: false },
  })
  public static async createCustomerService(ctx: Context) {
    try {
      await Joi.object({
        vehicle: Joi.number(),
        service: Joi.number(),
        package: Joi.number(),
        timeslot: Joi.object({
          date: Joi.string(),
          timeslot: Joi.number(),
        }),
        customer: Joi.number(),
        customerAddOns: Joi.object(),
        totalPrice: Joi.string(),
      }).validateAsync(ctx.request.body);
      const { timeslot, customerAddOns, totalPrice, ...body } =
        ctx.request.body;
      const customer = await CustomerRepository.one(body.customer);
      let schedule = null;
      if (timeslot) {
        schedule = await ScheduleRepository.createOrUpdateSchedule({
          date: timeslot.date,
          timeslot: timeslot.timeslot,
          customer: customer,
        });
      }
      let quote = null;
      if (!!totalPrice) {
        quote = await QuoteRepository.createOrUpdate({
          quoteDate: new Date(),
          quotedAmount: totalPrice,
          statusId: statusEnums.ACTIVE,
          customer: customer,
        });
      }
      const customerService = await CustomerServiceRepository.createOrUpdate({
        ...body,
        statusId: statusEnums.ACTIVE,
        ...(schedule ? { schedule: schedule } : {}),
        ...(quote ? { quote: quote } : {}),
      });
      if (!!customerAddOns) {
        await CustomerAddOnRepository.deleteCustomerAddOnsByCustomerServiceId(
          customerService.id,
        );
      }
      for (const key in customerAddOns) {
        const quantity = customerAddOns[key];
        await CustomerAddOnRepository.createOrUpdate({
          customerService: customerService,
          addOn: +key as any,
          quantity: quantity,
          customer: body.customer,
        });
      }
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Customer Service created successfully',
        customerService,
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
