import {
  DataTypeConfigWithManifest,
  DownloadButtonConfig,
  DropdownsWithButtonsProps,
  TabsConfig,
} from '../types';
import { SummaryTable } from '../ExplorerTable/types';
import { Gen3AppConfigData } from '../../../lib/content/types';
import { Accessibility, AggregationsData, FilterSet } from '@gen3/core';

interface FacetQueryParameters {
  type: string;
  fields: ReadonlyArray<string>;
  filters: FilterSet;
  accessibility?: Accessibility;
  filterSelf?: boolean;
}

interface FacetQueryResponse {
  data: AggregationsData;
  isSuccess: boolean;
  isFetching: boolean;
  isError: boolean;
}

interface FileCountsQueryParameters {
  repositoryFilters: FilterSet;
  cohortFilters?: FilterSet;
}

export interface FilesSizeData {
  total_file_size: number;
  total_case_count: number;
  total_file_count: number;
}

interface FileSizeQueryResponse {
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

export interface RepositoryConfiguration extends Gen3AppConfigData {
  filters?: TabsConfig; // filters for the fields
  guppyConfig: DataTypeConfigWithManifest; // guppy
  hooks: {
    useGetFacetValuesQuery: useGetFacetValuesQueryHook;
    useTotalFileSizeQuery: useTotalFileSizeQueryHook;
  };
  table?: SummaryTable; // table configuration
  dropdowns?: Record<string, DropdownsWithButtonsProps>; // dropdown menu of action buttons
  buttons?: ReadonlyArray<DownloadButtonConfig>; // row of action buttons
  loginForDownload?: boolean; // login required for download
}
