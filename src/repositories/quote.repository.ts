import { AppDataSource } from '../connection';
import { Quote } from '../entities/quote';
import { BadRequestError } from '../errors/badRequestError';

export const QuoteRepository = AppDataSource.getRepository(Quote).extend({
  async createOrUpdate(quoteObj: Partial<Quote>): Promise<Quote> {
    const exists = await this.createQueryBuilder('quote')
      .where('quote.customer = :customer', {
        customer: quoteObj.customer?.id || quoteObj.customer,
      })
      .getOne();

    if (exists) {
      quoteObj.updatedAt = new Date();
      this.merge(exists, quoteObj);
      return this.save(exists);
    }
    return this.save(quoteObj);
  },
  async createQuote(quoteObj: Partial<Quote>): Promise<Quote> {
    return this.save(quoteObj);
  },
  async deleteQuote(quoteId: number): Promise<void> {
    const quote = await this.findOne({
      where: {
        id: quoteId,
      },
    });
    if (!quote) {
      throw new BadRequestError('Quote not found!');
    }
    await this.remove(quote);
  },
  async deleteQuotesByCustomerId(customerId: number): Promise<void> {
    await this.createQueryBuilder('quote')
      .delete()
      .where('customer = :customer', {
        customer: customerId,
      })
      .execute();
  },
});
