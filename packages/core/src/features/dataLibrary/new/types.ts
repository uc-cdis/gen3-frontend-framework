import {
  DataLibrary,
  DataLibraryAPI,
  GroupedDataItems,
  UpdateDataLibraryListParams,
} from '../types';
import { JSONObject } from '../../../types';

export interface StorageError {
  isError?: boolean;
  status?: string;
}

export interface ReturnStatus<T = DataLibrary> extends StorageError {
  lists?: T;
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
  addList(list?: GroupedDataItems): Promise<ReturnStatus>;
  setAllLists(
    lists: Array<GroupedDataItems>,
  ): Promise<ReturnStatus<DataLibraryAPI>>;
  updateList(
    list: UpdateDataLibraryListParams,
  ): Promise<ReturnStatus<DataLibraryAPI>>;
  deleteList(id: string): Promise<ReturnStatus>;
  clearLists(): Promise<ReturnStatus>;
}
