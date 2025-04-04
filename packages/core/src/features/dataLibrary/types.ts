import { JSONObject } from '../../types';

// represents the auth access control for a DataList
export interface AuthZAccess {
  version: number;
  authz: string[];
}

// Possible values of an Item: File, Additional Value, Cohort
export type ItemValue =
  | string
  | number
  | undefined
  | Record<string, any>
  | boolean;

// Object representing an Item with its type
export interface ListItem {
  itemType: 'Data' | 'AdditionalData' | 'Gen3GraphQL';
  [k: string]: ItemValue;
}

/**
 *   A Data item: at the minimum it will have a guid and an item type
 */

export interface FileItem extends ListItem {
  guid: string;
  name?: string;
  description?: string;
  type?: string;
  size?: string;
  itemType: 'Data';
  dataset_guid?: string;
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
  dataset_guid?: string;
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
    typeof data.created_time !== 'string' ||
    typeof data.updated_time !== 'string' ||
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

export type DataSetMembers = Record<string, FileItem | AdditionalDataItem>;

/**
 * Represents a DataSet which is created by grouping File
 * objects with the same dataset_guids
 */
export interface DataLibraryDataset {
  id: string;
  name?: string;
  members: DataSetMembers; // Files and Additional Information
  itemType: 'Dataset';
}

export type DatasetOrCohort = Record<string, DataLibraryDataset | CohortItem>;

export type LibraryAPIItems = Record<
  string,
  FileItem | AdditionalDataItem | CohortItem
>;

export interface DatalistBase {
  name: string;
  id: string;
  created_time: string;
  updated_time: string;
  authz: AuthZAccess;
  version: number;
}

export interface DatalistAsAPIItems {
  name: string;
  items: LibraryAPIItems;
}

export interface GroupedDataItems {
  name: string;
  items: DatasetOrCohort; // a record of datasets and cohorts
}

export interface DataListUpdate extends GroupedDataItems {
  id: string;
}

export type Datalist = DatalistBase & GroupedDataItems;
export type DatalistAPI = DatalistBase & DatalistAsAPIItems;
// DataLibrary has been combined into data sets using BuildList
export type DataLibrary = Record<string, Datalist>;

// Data Library as represented in the Storage API
export type DataLibraryAPI = Record<string, DatalistAPI>;

export type DataLibraryAPIResponse = {
  lists: DataLibraryAPI;
};

/**
 * Type guard for DataLibraryAPIResponse
 */
export const isDataLibraryAPIResponse = (
  obj: unknown,
): obj is DataLibraryAPIResponse => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'lists' in obj &&
    typeof (obj as DataLibraryAPIResponse).lists === 'object'
  );
};

export interface UpdateDataLibraryListParams extends DatalistAsAPIItems {
  id: string;
}

export enum DataLibraryStoreMode {
  ApiOnly = 'apiOnly',
  ApiAndLocal = 'apiAndLocal',
  LocalOnly = 'localOnly',
}

export interface ExportDatasetFields {
  dataObjectField: string; // member that stores the id of the object that stores the id.
  datasetIdField: string; // member that stores the id of the "dataset" will default to uid
  datasetNameField: string; //  name of dateset
  dataObjectIdField: string; // field in data object
}
