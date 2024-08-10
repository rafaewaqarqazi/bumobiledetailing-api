import { statusEnums } from '../enums/statusEnums';
import { BadRequestError } from '../errors/badRequestError';
import { NotFoundError } from '../errors/notFoundError';
import { Admin } from '../entities/admin';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../connection';
import { config } from '../config';

export const AdminRepository = AppDataSource?.getRepository(Admin).extend({
  /**
   * @description Get one Admin by Email
   *
   * @param {number} email - The id of Admin
   *
   * @param noError
   */
  async findByEmail(email: string, noError?: boolean): Promise<Admin> {
    if (!email) throw new BadRequestError('admin email not provided');
    const admin = await this.findOne({
      where: {
        email,
        statusId: statusEnums.ACTIVE,
      },
      select: ['id', 'firstName', 'lastName', 'email', 'password'],
    });
    if (!admin && !noError) {
      throw new NotFoundError('Account not found!');
    }

    return admin;
  },
  /**
   * @description Get one Admin
   *
   * @param {number} id - The id of Admin
   *
   */
  async one(id: number): Promise<Admin> {
    if (!id) throw new BadRequestError('admin id not provided');
    const admin = await this.findOne({
      where: {
        id,
        statusId: statusEnums.ACTIVE,
      },
    });
    if (!admin) {
      throw new NotFoundError('Admin not found!');
    }

    return admin;
  },

  /**
   * @description Create Admin
   *
   * @param {object} adminObj - The adminObj of Admin
   *
   */
  async createAdmin(adminObj: Admin): Promise<Admin> {
    adminObj.statusId = statusEnums.ACTIVE;
    const exists: Admin = await this.findOne({
      where: {
        email: adminObj.email,
      },
    });
    if (exists) {
      throw new BadRequestError('Admin already exists');
    }
    adminObj.password = bcrypt.hashSync(adminObj.password, config.hashSaltRounds);
    const admin: Admin = await this.save(adminObj);
    if (!admin) {
      throw new BadRequestError('Could not create admin');
    }
    return admin;
  },

  /**
   * @description Update Admin
   *
   * @param {object} adminObj - The object of Admin
   */
  async updateAdmin(
    adminObj: Admin & {
      newPassword?: string;
      currentPassword?: string;
      newEmail?: string;
    }
  ): Promise<Admin> {
    if (!Admin.hasId(adminObj)) throw new BadRequestError('Admin id not provided');
    if (adminObj.newEmail) {
      const exists: Admin = await this.findOne({
        where: { email: adminObj.newEmail },
      });
      if (exists) {
        throw new NotFoundError('Email already exist');
      }
      adminObj.email = adminObj.newEmail;
      delete adminObj.newEmail;
    }

    const admin: Admin = await this.findOne(adminObj.id);
    if (!admin) {
      throw new NotFoundError('Admin not found');
    }
    if (adminObj.currentPassword) {
      const std = await this.findOne({
        where: { id: adminObj.id },
        select: ['password'],
      });
      if (!bcrypt.compareSync(adminObj.currentPassword, std.password)) {
        throw new NotFoundError('Incorrect current password');
      }
      delete adminObj.currentPassword;
    }
    if (adminObj.newPassword) {
      adminObj.password = bcrypt.hashSync(adminObj.newPassword, config.hashSaltRounds);
      delete adminObj.newPassword;
    }
    this.merge(admin, adminObj);
    await admin.save();

    return admin;
  },
  async deleteAdmin(id: number): Promise<number> {
    const admin = await this.findOne({
      where: {
        id: id,
      },
    });
    if (!admin) {
      throw new NotFoundError('Admin not found!');
    }
    await this.softRemove(admin);
    return id;
  },
});
