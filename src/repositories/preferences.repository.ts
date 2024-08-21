import { AppDataSource } from '../connection';
import { Preferences } from '../entities/customerPreferences';
import { BadRequestError } from '../errors/badRequestError';
import { NotFoundError } from '../errors/notFoundError';

export const PreferencesRepository = AppDataSource?.getRepository(
  Preferences,
).extend({
  /**
   * @description Get one Preference's by id
   *
   * @param {number} id - The id of Preferences
   *
   */
  async one(id: number): Promise<Preferences> {
    if (!id) throw new BadRequestError('preferences id not provided');
    const preferences = await this.findOne({
      where: {
        id,
      },
    });
    if (!preferences) {
      throw new NotFoundError('Preferences not found!');
    }

    return preferences;
  },

  /**
   * @description Create Preferences
   *
   * @param {object} preferencesObj - The preferencesObj of Preferences
   *
   */
  async createPreferences(preferencesObj: Preferences): Promise<Preferences> {
    return this.save(preferencesObj);
  },

  /**
   * @description Update Preferences
   *
   * @param {object} preferencesObj - The preferencesObj of Preferences
   *
   */
  async updatePreferences(preferencesObj: Preferences): Promise<Preferences> {
    const exists: Preferences = await this.findOne({
      where: {
        id: preferencesObj.id,
      },
    });
    if (!exists) {
      throw new NotFoundError('Preferences not found!');
    }
    this.merge(exists, preferencesObj);
    return this.save(exists);
  },
});
