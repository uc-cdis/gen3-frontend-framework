import {
  DataTypeConfigWithManifest,
  DownloadButtonConfig,
  DropdownsWithButtonsProps,
  TabsConfig,
} from '../types';
import { SummaryTable } from '../ExplorerTable/types';
import { Gen3AppConfigData } from '../../../lib/content/types';
import { Accessibility, AggregationsData, FilterSet } from '@gen3/core';
import React from 'react';

export interface FacetQueryParameters {
  type: string;
  fields: ReadonlyArray<string>;
  filters: FilterSet;
  accessibility?: Accessibility;
  filterSelf?: boolean;
  indexPrefix?: string;
}

export interface FacetQueryResponse {
  data: AggregationsData;
  isSuccess: boolean;
  isFetching: boolean;
  isError: boolean;
}

export interface FileCountsQueryParameters {
  repositoryFilters: FilterSet;
  cohortFilters?: FilterSet; // TODO: change to required
  accessibility?: Accessibility;
  cohortIndex: string;
  cohortIndexPrefix?: string;
  repositoryIndex: string;
  repositoryIndexPrefix?: string;
  cohortItemIdField: string;
  fileItemIdField: string;
  fileSizeField: string;
}

export interface FilesSizeData {
  totalFileSize: number;
  totalCaseCount: number;
  totalFileCount: number;
}

export interface FileSizeQueryResponse {
  data: FilesSizeData;
  isSuccess: boolean;
  isFetching: boolean;
  isError: boolean;
}

export type useGetFacetValuesQueryHook = (
  args: FacetQueryParameters,
) => FacetQueryResponse;
export type useTotalFileSizeQueryHook = (
  args: FileCountsQueryParameters,
) => FileSizeQueryResponse;

export interface FileStatsConfiguration {
  cohortIndex: string;
  repositoryIndex: string;
  cohortItemIdField: string;
  fileItemIdField: string;
  fileSizeField: string;
}

export interface RepositoryConfiguration extends Gen3AppConfigData {
  filters?: TabsConfig; // filters for the fields
  guppyConfig: DataTypeConfigWithManifest; // guppy
  table?: SummaryTable; // table configuration
  dropdowns?: Record<string, DropdownsWithButtonsProps>; // dropdown menu of action buttons
  buttons?: ReadonlyArray<DownloadButtonConfig>; // row of action buttons
  loginForDownload?: boolean; // login required for download
  fileStatsConfiguration: FileStatsConfiguration;
}

export interface RepositoryProps extends RepositoryConfiguration {
  additionalControls?: React.ReactNode | null;
}
