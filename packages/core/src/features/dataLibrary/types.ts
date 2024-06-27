import { JSONObject } from '../../types';

export interface AuthZAccess {
  version: number;
  authz: string[];
}

export interface ListItem extends JSONObject {
  name: string;
}

export interface CohortListItem extends ListItem {
  type: 'Cohort';
  data: JSONObject;
  schemaVersion: string;
}

export interface AdditionalData {
  id: string;
  description?: string;
  docs_link?: string;
  url?: string;
}

export interface ListItemDefinition {
  name: string;
  items: Record<string, ListItem | CohortListItem | AdditionalData>;
}

export interface DataList extends ListItemDefinition {
  id: string;
  created_time: string;
  updated_time: string;
  authz: AuthZAccess;
  version: number;
}

export type DataLibrary = Record<string, DataList>;
