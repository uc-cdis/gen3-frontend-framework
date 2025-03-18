import { Gen3AppConfigData } from '../../lib/content/types';
import { DataTypeConfig, TabConfig } from '../CohortBuilder/types';
import { IndexedFilterSet } from '@gen3/core';
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
  rquest: LeftNavItem;
}

export interface CohortDiscoveryGroup {
  readonly dataConfig: DataTypeConfig; // database config
  readonly tabTitle: string; // title of the tab
  readonly tabs: ReadonlyArray<TabConfig>; // filters for the fields
  readonly numColumns?: number;
  readonly emptySelection: EmptySelection; // What to show when no filters are selected
}

export interface CohortDiscoveryConfig extends Gen3AppConfigData {
  dataIndexes: Array<CohortDiscoveryGroup>;
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
  modified_datetime: string; // last time cohort was modified
  created_datetime: string;
  dataAccessRequests?: DataAccessRequest;
}

export const newCohort = (name: string, filters: IndexedFilterSet): Cohort => {
  const ts = new Date().toISOString();

  return {
    id: createCohortId(),
    name: name,
    filters: filters,
    modified_datetime: ts,
    created_datetime: ts,
  };
};

export interface DataAccessRequestUserInformation {
  name: string;
  institution: string;
  department?: string;
  address: string;
  email: string;
  phone: string;
}

enum DataAccessRequestStatus {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
}

export interface DataAccessRequest extends DataAccessRequestUserInformation {
  id: string;
  request_datetime: string;
  status: DataAccessRequestStatus;
  cohort: Cohort;
}

export const newDataAccessRequest = (
  userInformation: DataAccessRequestUserInformation,
  cohort: Cohort,
) => {
  return {
    id: createRequestId(),
    request_datetime: new Date().toISOString(),
    status: 'pending',
    cohort: cohort,
    ...userInformation,
  } as DataAccessRequest;
};
