import { JSONObject, type MetadataPaginationParams } from '@gen3/core';
import { SummaryStatistics } from '../Statistics/types';
import { KeyValueSearchFilter, SearchTerms } from '../../Discovery/types';

export interface QueryType {
  term: string;
  fields: string[];
  combineWith: 'AND' | 'OR';
}

export interface MetadataQueryProps {
  guidType: string;
  maxStudies: number;
  studyField: string;
  dataLoaderConfig: MetadataLoaderConfig;
}

export interface GetDataResponse {
  mdsData: JSONObject[];
  isUninitialized: boolean;
  isFetching: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export type MetadataDataHook = (
  props: Partial<MetadataQueryProps>,
) => GetDataResponse;

export interface MetadataLoaderProps extends Record<string, any> {
  pagination: MetadataPaginationParams;
  searchTerms: SearchTerms;
  dataLoaderConfig: MetadataLoaderConfig;
}

export interface MetadataRequestStatus {
  isFetching: boolean;
  isLoading: boolean;
  isUninitialized: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export interface MetadataHookResponse {
  data: Array<JSONObject>;
  hits: number;
  advancedSearchFilterValues: ReadonlyArray<KeyValueSearchFilter>;
  dataRequestStatus: MetadataRequestStatus;
  summaryStatistics: SummaryStatistics;
  suggestions: Array<string>;
  clearSearch?: () => void;
}

export interface MetadataLoaderConfig {
  dataFetchFunction?: string;
  dataFetchArgs?: JSONObject;
  sortingAndPagination?: 'client' | 'server';
}
