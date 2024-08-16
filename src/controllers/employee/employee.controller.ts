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
import { Employee, employeeSchema } from '../../entities/employee';
import { EmployeeRepository } from '../../repositories/employee.repository';
import { config } from '../../config';
import * as handlebars from 'handlebars';
import { readHTMLFile, sendEmail } from '../../services/email.service';
import * as nPath from 'path';
import { titleCase } from '../../utils/helpers';
@tagsAll(['Employee'])
export default class EmployeeController {
  @request('post', '/employee')
  @summary('Create Employee')
  @body({
    firstName: { type: 'string', required: true },
    lastName: { type: 'string', required: true },
    email: { type: 'string', required: true },
    password: { type: 'string', required: true },
    position: { type: 'string', required: true },
  })
  public static async createEmployee(ctx: Context) {
    try {
      await employeeSchema.validateAsync(ctx.request.body);
      const body = ctx.request.body as Employee;
      const user = await EmployeeRepository.createEmployee(body);
      const html = await readHTMLFile(
        nPath.join(
          nPath.resolve(),
          'src',
          'templates',
          'employee-registration-email-template.html',
        ),
      );
      const template = handlebars.compile(html);
      const replacements = {
        name: titleCase(user.firstName),
        email: user.email,
        password: body.password,
        position: titleCase(body.position),
        loginURL: `${config.frontendURL}/auth/login-employee`,
      };
      const htmlToSend = template(replacements);
      sendEmail({
        from: config.smtpEmail,
        to: user.email,
        subject: 'BU Mobile Detailing | Employee Registration',
        html: htmlToSend,
      });
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Employee created successfully',
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
  @request('get', '/employees')
  @summary('Get All Employees')
  @query({
    current: { type: 'number', required: false },
    pageSize: { type: 'number', required: false },
    queryString: { type: 'string', required: false },
  })
  public static async getAllEmployees(ctx: Context) {
    try {
      const query = ctx.request.query;
      const current = +query.current;
      const pageSize = +query.pageSize;
      const queryString = query.queryString as string;
      const position = query.position as string;
      const statusId = +query.statusId;
      const [employees, count] = await EmployeeRepository.list({
        current,
        pageSize,
        queryString,
        position,
        statusId,
      });
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Employees retrieved successfully',
        { res: employees, count, current, pageSize },
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
  @request('put', '/employee')
  @summary('Update Employee')
  @body({
    id: { type: 'number', required: true },
    firstName: { type: 'string', required: false },
    lastName: { type: 'string', required: false },
    email: { type: 'string', required: false },
    phone: { type: 'string', required: false },
    position: { type: 'string', required: false },
    statusId: { type: 'number', required: false },
  })
  public static async updateEmployee(ctx: Context) {
    try {
      const body = ctx.request.body as Employee;
      const employee = await EmployeeRepository.updateEmployee(body);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Employee updated successfully',
        employee,
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
  @request('get', '/employee/{id}')
  @summary('Get Employee By Id')
  @path({
    id: { type: 'number', required: true },
  })
  public static async getEmployeeById(ctx: Context) {
    try {
      const id = +ctx.params['id'];
      const employee = await EmployeeRepository.one(id);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Employee retrieved successfully',
        employee,
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
  @request('delete', '/employee/{id}')
  @summary('Delete Employee')
  @path({
    id: { type: 'number', required: true },
  })
  public static async deleteEmployee(ctx: Context) {
    try {
      const id = +ctx.params['id'];
      await EmployeeRepository.deleteEmployee(id);
      return new Response(
        ctx,
        responseCodeEnums.SUCCESS,
        'Employee deleted successfully',
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
