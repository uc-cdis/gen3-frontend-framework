import { DataLibrary, DatalistAsAPIItems } from '../types';

export interface StorageOperationResults {
  isError?: boolean;
  status: number;
  message: string;
}

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
