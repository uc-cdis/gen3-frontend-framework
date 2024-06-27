import { JsonDB, Config } from 'node-json-db';

const database = new JsonDB(new Config('myDataLibrary', true, false, '/'));

export default database;
