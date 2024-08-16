import { Context } from 'koa';
import { body, request, summary, tagsAll } from 'koa-swagger-decorator';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import winston from 'winston';
import jwt from 'jsonwebtoken';
import Response from '../../responses/response.handler';
import { responseCodeEnums } from '../../enums/responseCodeEnums';
import { CustomerRepository } from '../../repositories/customer.repository';
import { Customer } from '../../entities/customer';
import { Roles } from '../../enums/roles';
import { Admin } from '../../entities/admin';
import { AdminRepository } from '../../repositories/admin.repository';
import { Employee } from '../../entities/employee';
import { EmployeeRepository } from '../../repositories/employee.repository';
import { statusEnums } from '../../enums/statusEnums';
import dayjs from 'dayjs';
import { config } from '../../config';
import * as handlebars from 'handlebars';
import { readHTMLFile, sendEmail } from '../../services/email.service';
import * as nPath from 'path';
import { titleCase } from '../../utils/helpers';
@tagsAll(['Auth'])
export default class AuthController {
  @request('post', '/login')
  @summary('Login')
  @body({
    email: { type: 'string', required: true },
    password: { type: 'string', required: true },
    remember: { type: 'boolean', required: false },
  })
  public static async login(ctx: Context) {
    try {
      const schema: any = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        remember: Joi.boolean().optional(),
      });
      await schema.validateAsync(ctx.request.body);
      const body = ctx.request.body as Customer & { remember: boolean };
      const user = await CustomerRepository.findByEmail(body.email);

      if (!bcrypt.compareSync(body.password, user.password)) {
        return new Response(
          ctx,
          responseCodeEnums.BAD_REQUEST,
          'Incorrect Email or password',
        );
      }
      const accessToken: string = jwt.sign(
        { id: user.id, email: user.email, role: Roles.CUSTOMER },
        process.env.SECRET, // Token Secret that we sign it with
        {
          expiresIn: body.remember ? '1 year' : '2 days', // Token Expire time
        },
      );
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Logged in successfully',
        {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: Roles.CUSTOMER,
          accessToken,
        },
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
  @request('post', '/login-admin')
  @summary('Admin Login')
  @body({
    email: { type: 'string', required: true },
    password: { type: 'string', required: true },
    remember: { type: 'boolean', required: false },
  })
  public static async loginAdmin(ctx: Context) {
    try {
      const schema: any = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        remember: Joi.boolean().optional(),
      });
      await schema.validateAsync(ctx.request.body);
      const body = ctx.request.body as Admin & { remember: boolean };
      const admin = await AdminRepository.findByEmail(body.email);

      if (!bcrypt.compareSync(body.password, admin.password)) {
        return new Response(
          ctx,
          responseCodeEnums.BAD_REQUEST,
          'Incorrect Email or password',
        );
      }
      const accessToken: string = jwt.sign(
        { id: admin.id, email: admin.email, role: Roles.ADMIN },
        process.env.SECRET, // Token Secret that we sign it with
        {
          expiresIn: body.remember ? '1 year' : '2 days', // Token Expire time
        },
      );
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Logged in successfully',
        {
          id: admin.id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          role: Roles.ADMIN,
          accessToken,
        },
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
  @request('post', '/login-employee')
  @summary('Employee Login')
  @body({
    email: { type: 'string', required: true },
    password: { type: 'string', required: true },
    remember: { type: 'boolean', required: false },
  })
  public static async loginEmployee(ctx: Context) {
    try {
      const schema: any = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        remember: Joi.boolean().optional(),
      });
      await schema.validateAsync(ctx.request.body);
      const body = ctx.request.body as Employee & { remember: boolean };
      const admin = await EmployeeRepository.findByEmail(body.email);

      if (!bcrypt.compareSync(body.password, admin.password)) {
        return new Response(
          ctx,
          responseCodeEnums.BAD_REQUEST,
          'Incorrect Email or password',
        );
      }
      const accessToken: string = jwt.sign(
        { id: admin.id, email: admin.email, role: Roles.EMPLOYEE },
        process.env.SECRET, // Token Secret that we sign it with
        {
          expiresIn: body.remember ? '1 year' : '2 days', // Token Expire time
        },
      );
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Logged in successfully',
        {
          id: admin.id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          role: Roles.EMPLOYEE,
          accessToken,
        },
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
  @request('post', '/signup')
  @summary('Signup')
  @body({
    firstName: { type: 'string', required: true },
    lastName: { type: 'string', required: true },
    email: { type: 'string', required: true },
    password: { type: 'string', required: true },
  })
  public static async signup(ctx: Context) {
    try {
      const schema: any = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      });
      await schema.validateAsync(ctx.request.body);
      const body = ctx.request.body as Customer;
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
  @request('post', '/signup-admin')
  @summary('Signup')
  @body({
    firstName: { type: 'string', required: true },
    lastName: { type: 'string', required: true },
    email: { type: 'string', required: true },
    password: { type: 'string', required: true },
  })
  public static async signupAdmin(ctx: Context) {
    try {
      const schema: any = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      });
      await schema.validateAsync(ctx.request.body);
      const body = ctx.request.body as Admin;
      const user = await AdminRepository.createAdmin(body);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Admin created successfully',
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
  @request('post', '/forgot-password')
  @summary('Forgot Password Customer')
  @body({
    email: { type: 'string', required: true },
    isAdmin: { type: 'boolean', required: false },
    isEmployee: { type: 'boolean', required: false },
  })
  public static async forgotPassword(ctx: Context) {
    try {
      const schema: any = Joi.object({
        email: Joi.string().email().required(),
        isAdmin: Joi.boolean().optional(),
        isEmployee: Joi.boolean().optional(),
      });
      await schema.validateAsync(ctx.request.body);
      const body = ctx.request.body;
      await Joi.string().email().required().validateAsync(body.email);
      const repo = body.isAdmin
        ? AdminRepository
        : body.isEmployee
          ? EmployeeRepository
          : CustomerRepository;
      const userRes = await repo.findOne({
        where: {
          email: body.email,
          statusId: statusEnums.ACTIVE,
        },
        select: ['id', 'firstName', 'email', 'passResetAt'],
      });
      if (!userRes) {
        return new Response(
          ctx,
          responseCodeEnums.BAD_REQUEST,
          'Account Not Found Against Given mail (For further details Contact Support)',
        );
      }
      if (!!userRes.passResetAt) {
        const min = dayjs().diff(dayjs(userRes.passResetAt), 'minute');
        if (min < 5) {
          return new Response(
            ctx,
            responseCodeEnums.BAD_REQUEST,
            `Already Applied, (Retry in ${Math.ceil(5 - min)} minutes)`,
          );
        }
      }

      const token: string = jwt.sign(
        {
          id: userRes.id,
          email: userRes.email,
          role: body.isAdmin
            ? Roles.ADMIN
            : body.isEmployee
              ? Roles.EMPLOYEE
              : Roles.CUSTOMER,
        },
        process.env.SECRET, // Token Secret that we sign it with
        {
          expiresIn: 300, // Token Expire time
        },
      );
      const html = await readHTMLFile(
        nPath.join(
          nPath.resolve(),
          'src',
          'templates',
          'password-reset-email-template.html',
        ),
      );
      const template = handlebars.compile(html);
      const replacements = {
        name: titleCase(userRes.firstName),
        resetURL: `${config.frontendURL}/auth/reset-password?token=${token}`,
      };
      const htmlToSend = template(replacements);
      sendEmail({
        from: config.smtpEmail,
        to: userRes.email,
        subject: 'Reset password',
        html: htmlToSend,
      });
      userRes.passResetAt = new Date();
      await userRes.save();
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Kindly visit mail for further process',
      );
    } catch (err) {
      winston.log('error', `400 - ${ctx?.request?.url} - ${err}`);
      return new Response(
        ctx,
        responseCodeEnums.BAD_REQUEST,
        'Something Went Wrong',
      );
    }
  }

  @request('post', '/reset-password')
  @summary('Reset Password')
  @body({
    password: { type: 'string', required: true },
  })
  public static async resetPassword(ctx: Context) {
    try {
      const body = ctx.request.body;
      await Joi.string().required().validateAsync(body.password);

      let decodedToken: any;
      try {
        decodedToken = await jwt.verify(
          ctx.header.authorization,
          config.secret,
        );
      } catch (e) {
        return new Response(
          ctx,
          responseCodeEnums.BAD_REQUEST,
          'Token Expired, Please Request for reset password again',
        );
      }

      const Repo =
        decodedToken.role === Roles.ADMIN
          ? AdminRepository
          : decodedToken.role === Roles.EMPLOYEE
            ? EmployeeRepository
            : decodedToken.role === Roles.CUSTOMER
              ? CustomerRepository
              : null;
      if (!Repo) {
        return new Response(
          ctx,
          responseCodeEnums.UN_AUTHORIZED,
          'Unauthorized!',
        );
      }

      const res = await Repo.findOne({
        where: {
          id: decodedToken.id,
        },
      });
      if (!res) {
        return new Response(
          ctx,
          responseCodeEnums.NOT_FOUND,
          'Account Not Found',
        );
      }
      if (!res.passResetAt) {
        return new Response(
          ctx,
          responseCodeEnums.BAD_REQUEST,
          'Request Already Processed. Contact Support for Further Details',
        );
      }
      res.password = bcrypt.hashSync(body.password, config.hashSaltRounds);
      res.passResetAt = null;
      await res.save();
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Password Successfully Updated',
        {
          redirectUrl: `/auth/login${
            decodedToken.role === Roles.ADMIN
              ? '-admin'
              : decodedToken.role === Roles.EMPLOYEE
                ? '-employee'
                : ''
          }`,
        },
      );
    } catch (err) {
      winston.log('error', `400 - ${ctx?.request?.url} - ${err}`);
      return new Response(
        ctx,
        responseCodeEnums.BAD_REQUEST,
        'Something Went Wrong',
      );
    }
  }
}
