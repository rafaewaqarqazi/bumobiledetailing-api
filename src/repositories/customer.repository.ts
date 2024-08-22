import { statusEnums } from '../enums/statusEnums';
import { BadRequestError } from '../errors/badRequestError';
import { NotFoundError } from '../errors/notFoundError';
import { Customer } from '../entities/customer';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../connection';
import { config } from '../config';
import { PreferencesRepository } from './preferences.repository';

export const CustomerRepository = AppDataSource?.getRepository(Customer).extend(
  {
    /**
     * @description Get one Customer by Email
     *
     * @param {number} email - The id of Customer
     *
     * @param noError
     */
    async findByEmail(email: string, noError?: boolean): Promise<Customer> {
      if (!email) throw new BadRequestError('customer email not provided');
      const customer = await this.findOne({
        where: {
          email,
          statusId: statusEnums.ACTIVE,
        },
        select: ['id', 'firstName', 'lastName', 'email', 'password'],
      });
      if (!customer && !noError) {
        throw new NotFoundError('Account not found!');
      }

      return customer;
    },
    /**
     * @description Get one Customer
     *
     * @param {number} id - The id of Customer
     *
     */
    async one(id: number): Promise<Customer> {
      if (!id) throw new BadRequestError('customer id not provided');
      const customer = await this.findOne({
        where: {
          id,
          statusId: statusEnums.ACTIVE,
        },
        relations: ['preferences'],
      });
      if (!customer) {
        throw new NotFoundError('Customer not found!');
      }

      return customer;
    },

    /**
     * @description Create Customer
     *
     * @param {object} customerObj - The customerObj of Customer
     *
     */
    async createCustomer(customerObj: Customer): Promise<Customer> {
      customerObj.statusId = statusEnums.ACTIVE;
      const exists: Customer = await this.findOne({
        where: {
          email: customerObj.email,
        },
      });
      if (exists) {
        return exists;
      }
      if (customerObj.password) {
        customerObj.password = bcrypt.hashSync(
          customerObj.password,
          config.hashSaltRounds,
        );
      } else {
        customerObj.password = bcrypt.hashSync(
          Math.random().toString(36).substring(2),
          config.hashSaltRounds,
        );
      }

      if (customerObj.preferences) {
        customerObj.preferences = await PreferencesRepository.createPreferences(
          customerObj.preferences,
        );
      }
      const customer: Customer = await this.save(customerObj);
      if (!customer) {
        throw new BadRequestError('Could not create customer');
      }
      return customer;
    },

    /**
     * @description Update Customer
     *
     * @param {object} customerObj - The object of Customer
     */
    async updateCustomer(
      customerObj: Customer & {
        newPassword?: string;
        currentPassword?: string;
        newEmail?: string;
      },
    ): Promise<Customer> {
      if (!Customer.hasId(customerObj))
        throw new BadRequestError('Customer id not provided');
      if (customerObj.newEmail) {
        const exists: Customer = await this.findOne({
          where: { email: customerObj.newEmail },
        });
        if (exists) {
          throw new NotFoundError('Email already exist');
        }
        customerObj.email = customerObj.newEmail;
        delete customerObj.newEmail;
      }

      const customer: Customer = await this.findOne(customerObj.id);
      if (!customer) {
        throw new NotFoundError('Customer not found');
      }
      if (customerObj.currentPassword) {
        const std = await this.findOne({
          where: { id: customerObj.id },
          select: ['password'],
        });
        if (!bcrypt.compareSync(customerObj.currentPassword, std.password)) {
          throw new NotFoundError('Incorrect current password');
        }
        delete customerObj.currentPassword;
      }
      if (customerObj.newPassword) {
        customerObj.password = bcrypt.hashSync(
          customerObj.newPassword,
          config.hashSaltRounds,
        );
        delete customerObj.newPassword;
      }
      this.merge(customer, customerObj);
      await customer.save();

      return customer;
    },
    async list({
      current,
      pageSize,
      queryString,
      statusId,
    }: {
      current: number;
      pageSize: number;
      queryString: string;
      statusId: number;
    }): Promise<[Customer[], number]> {
      const query = this.createQueryBuilder('customer').leftJoinAndSelect(
        'customer.preferences',
        'preferences',
      );
      if (statusId) {
        query.andWhere('customer.statusId = :statusId', { statusId });
      }
      if (queryString) {
        query.andWhere(
          '(customer.firstName LIKE :queryString OR customer.lastName LIKE :queryString OR customer.email LIKE :queryString OR customer.phone LIKE :queryString)',
          { queryString: `%${queryString}%` },
        );
      }
      if (current && pageSize) {
        query.skip((current - 1) * pageSize).take(pageSize);
      }
      return await query.getManyAndCount();
    },
    async deleteCustomer(id: number): Promise<number> {
      const customer = await this.findOne({
        where: {
          id: id,
        },
      });
      if (!customer) {
        throw new NotFoundError('Customer not found!');
      }
      await this.softRemove(customer);
      return id;
    },
  },
);
