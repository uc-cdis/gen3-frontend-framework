import { JsonDB, Config } from 'node-json-db';
import { MyDataList } from './types';

const database = new JsonDB(new Config('myDataLibrary', true, false, '/'));

export default database;
