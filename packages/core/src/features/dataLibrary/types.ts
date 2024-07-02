import { JSONObject, JSONValue } from '../../types';

export interface AuthZAccess {
  version: number;
  authz: string[];
}

export interface ListItem {
  itemType: 'Data' | 'AdditionalData' | 'Gen3GraphQL';
  [k: string]: JSONValue | undefined;
}

/**
 *   A Data item: at the minimum it will have a guid and a item type
 */

export interface FileItem extends ListItem {
  guid: string;
  name?: string;
  description?: string;
  type?: string;
  size: number;
  itemType: 'Data';
}

export interface CohortItem extends ListItem {
  itemType: 'Gen3GraphQL';
  data: JSONObject;
  guid: string;
  name?: string;
  schemaVersion: string;
}

export interface AdditionalDataItem extends ListItem {
  description?: string;
  documentationUrl?: string;
  url?: string;
  itemType: 'AdditionalData';
}

export interface ListItemDefinition {
  name: string;
  items: Record<string, FileItem | CohortItem | AdditionalDataItem>;
}

export interface DataList extends ListItemDefinition {
  id: string;
  createdTime: string;
  updatedTime: string;
  authz: AuthZAccess;
  version: number;
}

export type DataLibrary = Record<string, DataList>;

export type DataLibraryAPIResponse = {
  lists: Record<string, JSONObject>;
};
