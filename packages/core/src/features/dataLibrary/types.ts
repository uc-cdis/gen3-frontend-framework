import { JSONObject } from '../../types';

export interface AuthZAccess {
  version: number;
  authz: string[];
}

export type ItemValue = string | number | undefined | Items;

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
  guid: string;
  name?: string;
  description?: string;
  type?: string;
  size?: string;
  itemType: 'Data';
}

export interface CohortItem extends ListItem {
  itemType: 'Gen3GraphQL';
  data: ItemValue;
  guid: string;
  name?: string;
  schemaVersion: string;
}

export interface AdditionalDataItem extends ListItem {
  description?: string;
  documentationUrl?: string;
  url?: string;
  itemType: 'AdditionalData';
  name: string;
}

export const isFileItem = (item: ListItem): item is FileItem => {
  return item && 'guid' in item;
};

export const isAdditionalDataItem = (item: any): item is AdditionalDataItem => {
  return (item as AdditionalDataItem).type === 'AdditionalData'; // TODO resolve this with type from the api
};

// Type guard for CohortItem
export const isCohortItem = (item: any): item is CohortItem => {
  return (
    item &&
    'data' in item &&
    'schema_version' in item &&
    item.type === 'Gen3GraphQL'
  );
};

export type DataSetItems = Record<string, FileItem | AdditionalDataItem>;

export interface DataListEntry {
  name: string;
  items: DataSetItems;
}

export interface RegisteredDataListEntry extends DataListEntry {
  id: string;
}

export interface DataList {
  id: string;
  createdTime: string;
  updatedTime: string;
  authz: AuthZAccess;
  version: number;
  name: string;
  items: Record<string, RegisteredDataListEntry | CohortItem>;
}

export type DataLibrary = Record<string, DataList>;

export type DataLibraryItems = {
  lists: DataLibrary;
};

export type DataLibraryAPIResponse = {
  lists: Record<string, JSONObject>;
};

export interface LoadAllListData {
  lists: Array<DataListEntry>;
}

export interface AddUpdateListParams {
  id: string;
  list: DataList;
}
