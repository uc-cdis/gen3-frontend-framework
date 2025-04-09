import {
  DataLibrary,
  DatalistAsAPIItems,
  UpdateDataLibraryListParams,
} from '../types';

export interface StorageError {
  isError?: boolean;
  status?: string;
}

export interface ReturnStatus<T = DataLibrary> extends StorageError {
  lists?: T;
}

export interface StorageService<T = DataLibrary> {
  getLists(): Promise<ReturnStatus<T>>;
  getList(id: string): Promise<ReturnStatus<T>>;
  addList(list?: DatalistAsAPIItems): Promise<ReturnStatus<T>>;
  setAllLists(lists: Array<DatalistAsAPIItems>): Promise<ReturnStatus<T>>;
  updateList(list: UpdateDataLibraryListParams): Promise<ReturnStatus<T>>;
  deleteList(id: string): Promise<ReturnStatus<T>>;
  clearLists(): Promise<ReturnStatus<T>>;
}
