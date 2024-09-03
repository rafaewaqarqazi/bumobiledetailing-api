import dayjs from 'dayjs';
import { Coupon } from '../entities/coupon';

export const currencyFormatter = Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  style: 'currency',
  currency: 'USD',
});
export const dateFormat = 'MM-DD-YYYY';
export const titleCase = (text = '') =>
  !!text
    ? text
        .split(/[']/gm)
        .map(capitalise)
        .join("'")
        .split(/\s/gm)
        .map(capitalise)
        .join(' ')
        ?.trim()
    : '';
const capitalise = (item) =>
  item?.includes("'")
    ? item
    : `${item.substring(0, 1).toUpperCase()}${item.substring(1).toLowerCase()}`;

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const statusNames = {
  1: 'Active',
  2: 'In Active',
  3: 'In Progress',
  4: 'Expired',
  5: 'Archive',
  6: 'Refunded',
  7: 'Deleted',
  8: 'Completed',
  9: 'Partial Refund',
  10: 'Canceled',
};

export const removeAllMarkdownFormatting = (text: string) => {
  return text
    .replace(/[*_~`]/g, '')
    .replace(/[#]/g, '')
    .replace(/[-]/g, ' ')
    .replace(/[\n]/g, ' ')
    .replace(/[\r]/g, ' ')
    .replace(/[\t]/g, ' ')
    .replace(/[\s]{2,}/g, ' ')
    .replace(/[\\]/g, '')
    .trim();
};

export const getESTTime = (date?: any) => {
  const utcTimestamp = date ? new Date(date).getTime() : Date.now();
  const estOffset = -4 * 60 * 60 * 1000; // 4 hours in milliseconds
  const estTimestamp = utcTimestamp + estOffset;
  return new Date(estTimestamp);
};

export const getDiscountedPriceByPercentage = (price, discount) =>
  Number((Number(price) - Number((discount / 100) * Number(price))).toFixed(2));
export const sanitizePhoneNumber = (phone: string) =>
  phone
    .replace(/\s/, '')
    .replace('(', '')
    .replace(')', '')
    .replace(/[-]/g, '')
    .replace(/\s/g, '');
export const sanitizeSMSAgentPrompt = (
  prompt: string,
  data: {
    coupon: Coupon;
    loginURL?: string;
    signUpURL?: string;
  },
) =>
  prompt
    ?.replace(/\[COMPANY_NAME\]/gm, 'BU Mobile Detailing')
    .replace(
      /\[DISCOUNT\]/gm,
      `${data?.coupon?.discountPercentage ? `${data?.coupon?.discountPercentage}%` : currencyFormatter.format(Number(data?.coupon?.discountAmount || 0))}`,
    )
    .replace(/\[COUPON_CODE\]/gm, data?.coupon?.code)

    .replace(/\[WEBSITE_URL\]/gm, 'https://www.bumobiledetailing.com')
    .replace(
      /\[DISCOUNT_ENDING\]/gm,
      dayjs().add(1, 'week').format(dateFormat),
    );
