import { JsonDB, Config } from 'node-json-db';

const database = new JsonDB(
  new Config('gen3_statistics_datastore', false, true, '/'),
);

export default database;
