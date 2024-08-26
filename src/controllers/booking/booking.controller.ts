import { Context } from 'koa';
import { body, query, request, summary, tagsAll } from 'koa-swagger-decorator';
import winston from 'winston';
import Response from '../../responses/response.handler';
import { responseCodeEnums } from '../../enums/responseCodeEnums';
import Joi from 'joi';
import { CustomerServiceRepository } from '../../repositories/customer.service.repository';
import { statusEnums } from '../../enums/statusEnums';
import { ScheduleRepository } from '../../repositories/schedule.repository';
import { CustomerAddOnRepository } from '../../repositories/customer.addOn.repository';
import { readHTMLFile, sendEmail } from '../../services/email.service';
import nPath from 'path';
import handlebars from 'handlebars';
import { titleCase } from '../../utils/helpers';
import { config } from '../../config';
import { CustomerRepository } from '../../repositories/customer.repository';
import { VehicleRepository } from '../../repositories/vehicle.repository';
@tagsAll(['Booking'])
export default class BookingController {
  @request('post', '/booking')
  @summary('Create Booking')
  @body({
    service: { type: 'number', required: true },
  })
  public static async createBooking(ctx: Context) {
    try {
      await Joi.object({
        totalPrice: Joi.string().required(),
        vehicle: Joi.object({
          type: Joi.string().required(),
          make: Joi.string().required(),
          model: Joi.string().required(),
          year: Joi.number().required(),
          // licensePlate: Joi.string().required(),
        }).required(),
        service: Joi.number().required(),
        package: Joi.number().required(),
        timeslot: Joi.object({
          date: Joi.string().required(),
          timeslot: Joi.number().required(),
        }).required(),
        customer: Joi.number().required(),
        customerAddOns: Joi.object().required(),
      }).validateAsync(ctx.request.body);
      const body = ctx.request.body;
      const customer = await CustomerRepository.one(body.customer);
      const vehicle = await VehicleRepository.createOrUpdateVehicle({
        ...body.vehicle,
        customer: customer,
      });
      const schedule = await ScheduleRepository.createOrUpdateSchedule({
        date: body.timeslot.date,
        timeslot: body.timeslot.timeslot,
        customer: customer,
      });
      const customerService = await CustomerServiceRepository.createOrUpdate({
        service: body.service,
        package: body.package,
        customer: body.customer,
        statusId: statusEnums.ACTIVE,
        schedule: schedule,
        vehicle: vehicle,
      });
      const customerAddOns = body.customerAddOns;
      for (const key in customerAddOns) {
        const quantity = customerAddOns[key];
        await CustomerAddOnRepository.createOrUpdate({
          customerService: customerService,
          addOn: +key as any,
          quantity: quantity,
          customer: body.customer,
        });
      }
      const html = await readHTMLFile(
        nPath.join(
          nPath.resolve(),
          'src',
          'templates',
          'booking-email-template.html',
        ),
      );
      const template = handlebars.compile(html);
      const newCustomerService = await CustomerServiceRepository.one(
        customerService.id,
      );
      const replacements = {
        name: titleCase(`${customer.firstName} ${customer.lastName}`),
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        service: newCustomerService.service.name,
        package: newCustomerService.package.name,
        schedule: `${newCustomerService.schedule.date} ${newCustomerService.schedule.timeslot.time}`,
        price: body.totalPrice,
        addOns: newCustomerService.customerAddOns.map((addOn) => ({
          name: addOn.addOn.name,
          quantity: addOn.quantity,
        })),
        vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      };
      const htmlToSend = template(replacements);
      sendEmail({
        from: config.smtpEmail,
        to: config.smtpEmail,
        subject: 'BU Mobile Detailing | Booking Created',
        html: htmlToSend,
      });
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Booking created successfully',
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

  @request('get', '/bookings')
  @summary('Get Bookings')
  @query({
    current: { type: 'number', required: false },
    pageSize: { type: 'number', required: false },
    queryString: { type: 'string', required: false },
  })
  public static async getBookings(ctx: Context) {
    try {
      const query = ctx.request.query;
      const current = +query.current;
      const pageSize = +query.pageSize;
      const queryString = query.queryString as string;
      const [bookings, count] = await CustomerServiceRepository.list({
        current,
        pageSize,
        queryString,
      });
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Bookings fetched successfully',
        { res: bookings, count, current, pageSize },
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
