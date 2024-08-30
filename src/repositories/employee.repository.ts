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
      if (employeeObj.password) {
        employeeObj.password = bcrypt.hashSync(
          employeeObj.password,
          config.hashSaltRounds,
        );
      } else {
        employeeObj.password = bcrypt.hashSync(
          Math.random().toString(36).substring(2),
          config.hashSaltRounds,
        );
      }
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
      },
    ): Promise<Employee> {
      if (!Employee.hasId(employeeObj))
        throw new BadRequestError('Employee id not provided');

      const employee: Employee = await this.findOne({
        where: {
          id: employeeObj.id,
        },
      });
      if (!employee) {
        throw new NotFoundError('Employee not found');
      }
      if (employeeObj.email !== employee.email) {
        const exists: Employee = await this.findOne({
          where: {
            email: employeeObj.email,
          },
        });
        if (exists) {
          throw new BadRequestError('Employee email already exists');
        }
      }

      if (employeeObj.newPassword) {
        employeeObj.password = bcrypt.hashSync(
          employeeObj.newPassword,
          config.hashSaltRounds,
        );
        delete employeeObj.newPassword;
      }
      employeeObj.updatedAt = new Date();
      this.merge(employee, employeeObj);
      await employee.save();

      return employee;
    },
    async list({
      current,
      pageSize,
      queryString,
      position,
      statusId,
    }: {
      current?: number;
      pageSize?: number;
      queryString?: string;
      position?: string;
      statusId?: number;
    }): Promise<[Employee[], number]> {
      const query = this.createQueryBuilder('employee')
        .leftJoinAndSelect('employee.serviceAssignments', 'serviceAssignments')
        .leftJoinAndSelect('employee.schedules', 'schedules');
      if (queryString) {
        query.andWhere(
          `(employee.firstName like :queryString 
          or employee.lastName like :queryString 
          or employee.email like :queryString 
          or employee.phone like :queryString
        )`,
          {
            queryString: `%${queryString}%`,
          },
        );
      }
      if (position) {
        query.andWhere('employee.position = :position', { position });
      }
      if (statusId) {
        query.andWhere('employee.statusId = :statusId', { statusId });
      }
      if (pageSize) {
        query.skip((current - 1) * pageSize).take(pageSize);
      }
      return query.getManyAndCount();
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
