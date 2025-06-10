import { Gen3AppConfigData } from '../../lib/content/types';
import { DataTypeConfig, TabConfig } from '../CohortBuilder/types';
import { IndexedFilterSet, type RemoteSupportConfiguration } from '@gen3/core';
import { nanoid } from '@reduxjs/toolkit';

interface EmptySelection {
  image: string;
  imageAlt: string;
  title?: string;
  subHead?: string;
}

interface LeftNavItem {
  image: string;
  imageAlt: string;
  title: string;
}

interface LeftNav {
  build: LeftNavItem;
  saved: LeftNavItem;
  request: LeftNavItem;
}

export interface CohortDiscoveryGroup {
  dataConfig: DataTypeConfig; // database config
  resourcePath?: string;
  resourceField: string; //  field used as authz resource to request access
  tabTitle: string; // title of the tab
  tabs: ReadonlyArray<TabConfig>; // filters for the fields
  numColumns?: number; // number of cards to show in a row.
  emptySelection: EmptySelection; // What to show when no filters are selected
}

export interface SupportServiceConfiguration {
  service: string;
  configuration: RemoteSupportConfiguration;
}

export interface CohortDiscoveryConfig extends Gen3AppConfigData {
  dataIndexes: Array<CohortDiscoveryGroup>;
  remoteSupportService: SupportServiceConfiguration;
  emptySelection: EmptySelection;
  leftNav: LeftNav;
}

export type SupportedFacetTypes = 'enum';
export type CohortId = string;
const createCohortId = (): string => nanoid();
const createRequestId = (): string => nanoid();

export interface Cohort {
  id: string;
  name: string;
  filters: IndexedFilterSet; // maps of index to filter set
  modified?: boolean; // flag which is set to true if modified and unsaved
  modifiedDatetime: string; // last time cohort was modified
  createdDatetime: string;
  requestedAccess: boolean;
  requestId: string;
}

export const newCohort = (name: string, filters: IndexedFilterSet): Cohort => {
  const ts = new Date().toISOString();

  return {
    id: createCohortId(),
    name: name,
    filters: filters,
    modifiedDatetime: ts,
    createdDatetime: ts,
    requestedAccess: false,
    requestId: 'no_request_id',
  };
};

export interface DataAccessRequestUserInformation {
  name: string;
  email: string;
}

export enum DataAccessRequestStatus {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
  signed = 'signed',
  submitted = 'submitted',
  draft = 'draft',
  unknown = 'unknown',
}

export interface DataAccessRequest extends DataAccessRequestUserInformation {
  id: string;
  createdDatetime: string;
  updatedDatetime: string;
  status: DataAccessRequestStatus;
  cohortId: CohortId;
}

export const newDataAccessRequest = (
  requestId: string,
  status: DataAccessRequestStatus,

  userInformation: DataAccessRequestUserInformation,
  cohortId: CohortId,
) => {
  const now = new Date().toISOString();
  return {
    id: requestId,
    createdDatetime: now,
    updatedDatetime: now,
    status: status,
    cohortId,
    ...userInformation,
  } satisfies DataAccessRequest;
};

export interface ActionButtonProps {
  index: string;
}
// Interface for extracting resources used to create a
// requestor request
interface ResourceField {
  resourcePath?: string;
  resourceField: string;
}
// mapping index to resource path and data field for a requestor
// cohort request
export type IndexResourceField = Record<string, ResourceField>;
