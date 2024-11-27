import { JSONObject } from '../../types';

export interface AuthZAccess {
  version: number;
  authz: string[];
}

export type ItemValue =
  | string
  | number
  | undefined
  | Record<string, any>
  | boolean;

export interface Items {
  [k: string]: ItemValue;
}

export interface ListItem {
  itemType: 'Data' | 'AdditionalData' | 'Gen3GraphQL';
  [k: string]: ItemValue;
}

/**
 *   A Data item: at the minimum it will have a guid and an item type
 */

export interface FileItem extends ListItem {
  id: string; // TODO: remove id or guid
  guid: string;
  name?: string;
  description?: string;
  type?: string;
  size?: string;
  itemType: 'Data';
  datasetGuid: string;
}

export interface CohortItem extends ListItem {
  itemType: 'Gen3GraphQL';
  data: JSONObject;
  name: string;
  schemaVersion: string;
  id: string;
  index: string;
}

export interface AdditionalDataItem extends ListItem {
  description?: string;
  documentationUrl?: string;
  url?: string;
  itemType: 'AdditionalData';
  name: string;
  datasetGuid: string;
}

export const isFileItem = (item: any): item is FileItem => {
  return item && 'itemType' in item && item.itemType === 'Data';
};

export const isAdditionalDataItem = (item: any): item is AdditionalDataItem => {
  return (item as AdditionalDataItem).itemType === 'AdditionalData'; // TODO resolve this with type from the api
};

// Type guard for CohortItem
export const isCohortItem = (item: any): item is CohortItem => {
  return (
    item &&
    'data' in item &&
    'schemaVersion' in item &&
    item.itemType === 'Gen3GraphQL'
  );
};

///export type DataSetItems = Record<string, FileItem | AdditionalDataItem>;

/**
 * Represents a DataSet which is created by grouping File
 * objects with the same dataset_guids
 */
// export interface DataListEntry {
//   name?: string; // TODO: figure out how to set name
//   items: DataSetItems;
// }

// export interface RegisteredDataListEntry extends DataListEntry {
//   id: string;
// }

// export type FilesOrCohort = Record<
//   string,
//   DataSetItems | CohortItem
// >;

export type LibraryAPIItems = Record<
  string,
  FileItem | AdditionalDataItem | CohortItem
>;

export type DatalistItems = Record<
  string,
  FileItem | AdditionalDataItem | CohortItem
>;

export interface Datalist {
  id: string;
  createdTime: string;
  updatedTime: string;
  authz: AuthZAccess;
  version: number;
  name: string;
  items: DatalistItems;
}

export type DataLibrary = Record<string, Datalist>;

export type DataLibraryItems = {
  lists: DataLibrary;
};

export type DataLibraryAPIResponse = {
  lists: Record<string, JSONObject>;
};

export interface LoadAllListData {
  lists: Array<Datalist>;
}

export interface AddUpdateListParams {
  id: string;
  list: Datalist;
}
