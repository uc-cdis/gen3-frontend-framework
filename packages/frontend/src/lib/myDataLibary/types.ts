import { JSONObject } from '@gen3/core';

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

export interface MyDataList {
  id: string;
  name: string;
  created_time: string;
  updated_time: string;
  creator: string;
  items: Record<string, ListItem | CohortListItem | AdditionalData>;
  authz: AuthZAccess;
}
