import { DataLibrary, Datalist, NamedDataItems } from '../types';
import { JSONObject } from '../../../types';

export interface StorageError {
  isError?: boolean;
  status?: string;
}

export interface ReturnStatus extends StorageError {
  lists?: DataLibrary;
}

export type DataLibraryAPIResponse = {
  lists: Record<string, JSONObject>;
};

export type DataLibraryId = string;

export const isDataLibraryAPIResponse = (
  value: unknown,
): value is DataLibraryAPIResponse =>
  typeof value === 'object' &&
  value !== null &&
  'lists' in value &&
  typeof (value as any).lists === 'object' &&
  Object.keys((value as any).lists).every(
    (key) =>
      typeof key === 'string' &&
      typeof (value as any).lists[key] === 'object' &&
      (value as any).lists[key] !== null,
  );

export interface StorageService {
  getLists(): Promise<ReturnStatus>;
  getList(id: string): Promise<ReturnStatus>;
  addList(list?: Partial<Datalist>): Promise<ReturnStatus>;
  setAllLists(lists: Array<NamedDataItems>): Promise<ReturnStatus>;
  updateList(list: Datalist): Promise<ReturnStatus>;
  deleteList(id: string): Promise<ReturnStatus>;
  clearLists(): Promise<ReturnStatus>;
}
