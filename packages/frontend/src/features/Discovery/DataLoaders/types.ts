import { JSONObject } from '@gen3/core';
import { DiscoveryIndexConfig } from '../types';

export interface QueryType {
  term: string;
  fields: string[];
  combineWith: 'AND' | 'OR';
}

export interface GetDataProps {
  guidType: string;
  maxStudies: number;
  studyField: string;
  discoveryConfig?: DiscoveryIndexConfig;
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
  props: Partial<GetDataProps>,
) => GetDataResponse;
