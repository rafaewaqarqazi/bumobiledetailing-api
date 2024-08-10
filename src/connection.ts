import { DataSource } from 'typeorm';
import { config } from './config';
import { entities } from './entities';

const sync: boolean = config.syncDb;

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: config.dbHost,
  port: config.dbPort,
  username: config.dbUser,
  password: config.dbPassword,
  database: config.dbName,
  entities: entities,
  /**
   * [true] - Make `synchronize` to `true` If Want Modification in db, Based on Given Entites
   * [false] {Recommended} - Make `synchronize` to `false` if don't Want Any Modification in db, based on Given Entities
   */
  synchronize: sync,
  logging: false,
});
