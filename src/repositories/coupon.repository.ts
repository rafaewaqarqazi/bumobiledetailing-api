import { AppDataSource } from '../connection';
import { Coupon } from '../entities/coupon';
import { BadRequestError } from '../errors/badRequestError';
import dayjs from 'dayjs';

export const CouponRepository = AppDataSource.getRepository(Coupon).extend({
  async createOrUpdateCoupon(couponObj: Partial<Coupon>): Promise<Coupon> {
    const exists = await this.createQueryBuilder('coupon')
      .andWhere('coupon.code = :code', {
        code: couponObj.code,
      })
      .getOne();

    if (exists) {
      throw new BadRequestError('Coupon already exists!');
    }
    return this.save(couponObj);
  },
  async updateCoupon(couponObj: Partial<Coupon>): Promise<Coupon> {
    if (!couponObj.id) {
      throw new BadRequestError('Coupon ID not provided!');
    }
    const exists = await this.findOne({
      where: {
        id: couponObj.id,
      },
    });
    if (!exists) {
      throw new BadRequestError('Coupon not found!');
    }
    if (exists.code !== couponObj.code) {
      const existsCode = await this.createQueryBuilder('coupon')
        .andWhere('coupon.code = :code', {
          code: couponObj.code,
        })
        .getOne();
      if (existsCode) {
        throw new BadRequestError('Coupon code already exists!');
      }
    }
    couponObj.updatedAt = new Date();
    this.merge(exists, couponObj);
    return await this.save(exists);
  },
  async list({
    current,
    pageSize,
    queryString,
  }: {
    current?: number;
    pageSize?: number;
    queryString?: string;
  }): Promise<[Coupon[], number]> {
    const query = this.createQueryBuilder('coupon');
    if (queryString) {
      query.andWhere('coupon.code LIKE :code', {
        code: `%${queryString}%`,
      });
    }
    if (current && pageSize) {
      query.skip((current - 1) * pageSize).take(pageSize);
    }
    return query.getManyAndCount();
  },
  async one(couponId: number): Promise<Coupon> {
    const coupon = await this.findOne({
      where: {
        id: couponId,
      },
    });
    if (!coupon) {
      throw new BadRequestError('Coupon not found!');
    }
    return coupon;
  },
  async getByCode(code: string): Promise<Coupon> {
    const coupon = await this.findOne({
      where: {
        code,
      },
    });
    if (!coupon) {
      throw new BadRequestError('Coupon not found!');
    }
    if (dayjs(coupon.endAt).isBefore(dayjs())) {
      throw new BadRequestError('Coupon has expired!');
    }
    if (dayjs(coupon.startAt).isAfter(dayjs())) {
      throw new BadRequestError('Coupon is not active yet!');
    }
    return coupon;
  },
  async deleteCoupon(couponId: number): Promise<void> {
    const coupon = await this.findOne({
      where: {
        id: couponId,
      },
    });
    if (!coupon) {
      throw new BadRequestError('Coupon not found!');
    }
    await this.remove(coupon);
  },
});
