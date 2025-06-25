import { DataLibrary, DatalistAsAPIItems } from '../types';
import { StorageOperationResults } from '../../../types';

export interface ReturnStatus<T = DataLibrary> extends StorageOperationResults {
  lists?: T;
}

export interface StorageService<T = DataLibrary> {
  getLists(): Promise<ReturnStatus<T>>;
  getList(id: string): Promise<ReturnStatus<T>>;
  addList(list?: DatalistAsAPIItems): Promise<ReturnStatus<T>>;
  setAllLists(lists: Array<DatalistAsAPIItems>): Promise<ReturnStatus<T>>;
  updateList(id: string, list: DatalistAsAPIItems): Promise<ReturnStatus<T>>;
  deleteList(id: string): Promise<ReturnStatus<T>>;
  clearLists(): Promise<ReturnStatus<T>>;
}
