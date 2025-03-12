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
}

export interface AdditionalDataItem extends ListItem {
  description?: string;
  documentationUrl?: string;
  url?: string;
  itemType: 'AdditionalData';
  name: string;
  datasetGuid: string;
}

export const isFileItem = (item: ListItem): item is FileItem => {
  return item && 'guid' in item;
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

// Type guard for DatalistAPI
export const isDatalistAPI = (value: unknown): value is DatalistAPI => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const data = value as Partial<DatalistAPI>;

  // Check required properties in DataItemBaseData
  if (
    typeof data.name !== 'string' ||
    typeof data.id !== 'string' ||
    typeof data.createdTime !== 'string' ||
    typeof data.updatedTime !== 'string' ||
    typeof data.version !== 'number' ||
    typeof data.authz !== 'object' ||
    data.authz === null ||
    !Array.isArray(data.authz.authz)
  ) {
    return false;
  }

  // Check required properties in DatalistAsItems
  if (
    typeof data.items !== 'object' ||
    data.items === null ||
    typeof (data.items as Record<string, unknown>) !== 'object'
  ) {
    return false;
  }

  return true;
};

export type DataSetItems = Record<string, FileItem | AdditionalDataItem>;

/**
 * Represents a DataSet which is created by grouping File
 * objects with the same dataset_guids
 */
export interface DataListEntry {
  name?: string;
  items: DataSetItems;
}

export interface DataLibraryDataset extends DataListEntry {
  id: string;
}

export type FilesOrCohort = Record<string, DataLibraryDataset | CohortItem>;

export type LibraryAPIItems = Record<
  string,
  FileItem | AdditionalDataItem | CohortItem
>;

export interface DataItemBaseData {
  name: string;
  id: string;
  createdTime: string;
  updatedTime: string;
  authz: AuthZAccess;
  version: number;
}

export interface DatalistAsItems {
  name: string;
  items: LibraryAPIItems;
}

export interface GroupedDataItems {
  name: string;
  items: FilesOrCohort;
}

export type Datalist = DataItemBaseData & GroupedDataItems;
export type DatalistAPI = DataItemBaseData & DatalistAsItems;
// Data Library has been combine into data sets using BuildList
export type DataLibrary = Record<string, Datalist>;

// Data Library as represented by  the API
export type DataLibraryAPI = Record<string, DatalistAPI>;

export type DataLibraryAPIResponse = {
  lists: Record<string, JSONObject>;
};

export type DataLibraryGroupedResponse = {
  lists: DataLibrary;
};

export interface LoadAllListData {
  lists: Array<DataListEntry>;
}

export interface UpdateDataLibraryListParams extends DatalistAsItems {
  id: string;
}
