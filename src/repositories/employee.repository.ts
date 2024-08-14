import { statusEnums } from '../enums/statusEnums';
import { BadRequestError } from '../errors/badRequestError';
import { NotFoundError } from '../errors/notFoundError';
import { Employee } from '../entities/employee';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../connection';
import { config } from '../config';

export const EmployeeRepository = AppDataSource?.getRepository(Employee).extend(
  {
    /**
     * @description Get one Employee by Email
     *
     * @param {number} email - The id of Employee
     *
     * @param noError
     */
    async findByEmail(email: string, noError?: boolean): Promise<Employee> {
      if (!email) throw new BadRequestError('employee email not provided');
      const employee = await this.findOne({
        where: {
          email,
          statusId: statusEnums.ACTIVE,
        },
        select: ['id', 'firstName', 'lastName', 'email', 'password'],
      });
      if (!employee && !noError) {
        throw new NotFoundError('Account not found!');
      }

      return employee;
    },
    /**
     * @description Get one Employee
     *
     * @param {number} id - The id of Employee
     *
     */
    async one(id: number): Promise<Employee> {
      if (!id) throw new BadRequestError('employee id not provided');
      const employee = await this.findOne({
        where: {
          id,
          statusId: statusEnums.ACTIVE,
        },
      });
      if (!employee) {
        throw new NotFoundError('Employee not found!');
      }

      return employee;
    },

    /**
     * @description Create Employee
     *
     * @param {object} employeeObj - The employeeObj of Employee
     *
     */
    async createEmployee(employeeObj: Employee): Promise<Employee> {
      employeeObj.statusId = statusEnums.ACTIVE;
      const exists: Employee = await this.findOne({
        where: {
          email: employeeObj.email,
        },
      });
      if (exists) {
        throw new BadRequestError('Employee already exists');
      }
      employeeObj.password = bcrypt.hashSync(
        employeeObj.password,
        config.hashSaltRounds,
      );
      const employee: Employee = await this.save(employeeObj);
      if (!employee) {
        throw new BadRequestError('Could not create employee');
      }
      return employee;
    },

    /**
     * @description Update Employee
     *
     * @param {object} employeeObj - The object of Employee
     */
    async updateEmployee(
      employeeObj: Employee & {
        newPassword?: string;
        currentPassword?: string;
        newEmail?: string;
      },
    ): Promise<Employee> {
      if (!Employee.hasId(employeeObj))
        throw new BadRequestError('Employee id not provided');
      if (employeeObj.newEmail) {
        const exists: Employee = await this.findOne({
          where: { email: employeeObj.newEmail },
        });
        if (exists) {
          throw new NotFoundError('Email already exist');
        }
        employeeObj.email = employeeObj.newEmail;
        delete employeeObj.newEmail;
      }

      const employee: Employee = await this.findOne(employeeObj.id);
      if (!employee) {
        throw new NotFoundError('Employee not found');
      }
      if (employeeObj.currentPassword) {
        const std = await this.findOne({
          where: { id: employeeObj.id },
          select: ['password'],
        });
        if (!bcrypt.compareSync(employeeObj.currentPassword, std.password)) {
          throw new NotFoundError('Incorrect current password');
        }
        delete employeeObj.currentPassword;
      }
      if (employeeObj.newPassword) {
        employeeObj.password = bcrypt.hashSync(
          employeeObj.newPassword,
          config.hashSaltRounds,
        );
        delete employeeObj.newPassword;
      }
      this.merge(employee, employeeObj);
      await employee.save();

      return employee;
    },
    async deleteEmployee(id: number): Promise<number> {
      const employee = await this.findOne({
        where: {
          id: id,
        },
      });
      if (!employee) {
        throw new NotFoundError('Employee not found!');
      }
      await this.softRemove(employee);
      return id;
    },
  },
);
