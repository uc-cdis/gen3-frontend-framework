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

export type DataSetItems = Record<string, FileItem | AdditionalDataItem>;

export interface DataSet {
  name: string;
  id: string;
  items: DataSetItems;
}

export interface DataList {
  id: string;
  createdTime: string;
  updatedTime: string;
  authz: AuthZAccess;
  version: number;
  items: Record<string, DataSet | CohortItem>;
}

export type DataLibrary = Record<string, DataList>;

export type DataLibraryAPIResponse = {
  lists: Record<string, JSONObject>;
};
