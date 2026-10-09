import type { DataLibraryStoreMode, JSONObject } from '@gen3/core';
import {
  type AggregationsData,
  type ExportDatasetFields,
  type MetadataPaginationParams,
} from '@gen3/core';

import type {
  SummaryStatistics,
  SummaryStatisticsConfig,
} from './Statistics/types';
import type { AdvancedSearchTerms, SearchCombination } from './Search/types';
import type { CollapsableChartsPanelConfiguration } from '../../components/charts/types';
import type {
  StudyColumn,
  StudyDetailsField,
  StudyDetailView,
  StudyPageConfig,
  TagsConfig,
} from '../Study/types';
import type { DataAuthorization } from '../../utils';
import type { Gen3AppConfigData } from '../../lib/content/types';
import type { SearchMode } from './constants';

interface KeywordSearch {
  keywords?: string[];
  operator: SearchCombination;
}

export interface SearchTerms {
  keyword: KeywordSearch;
  advancedSearchTerms: AdvancedSearchTerms;
  selectedTags?: SelectedTags;
}

export interface SelectedTags {
  [key: string]: boolean;
}

export interface CategoryObject {
  categoryDisplayName: string;
  tags: string[];
  color: string;
}

export interface DiscoveryDataLoaderProps extends Record<string, any> {
  pagination: MetadataPaginationParams;
  searchTerms: SearchTerms;
  discoveryConfig: DiscoveryIndexConfig;
  selectedFieldsForSearchIndexing?: string[];
  searchMode?: SearchMode;
}

export interface DataRequestStatus {
  isFetching: boolean;
  isLoading: boolean;
  isUninitialized: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export interface DiscoverDataHookResponse {
  data: Array<JSONObject>;
  hits: number;
  /** number of studies dropped because they have no uid field */
  missingIdCount?: number;
  advancedSearchFilterValues: ReadonlyArray<KeyValueSearchFilter>;
  dataRequestStatus: DataRequestStatus;
  summaryStatistics: SummaryStatistics; // counts and sums
  charts: AggregationsData; // bucket counts for charts
  suggestions: Array<string>;
  clearSearch?: () => void;
  tagCategoryData?: CategoryObject[] | undefined;
}

export type DiscoveryTableDataHook = (
  dataHookArgs: DiscoveryDataLoaderProps,
  ...args: any[]
) => DiscoverDataHookResponse;

export interface KeyValueSearchFilter {
  key: string;
  keyDisplayName?: string;
  valueDisplayNames?: Record<string, string>;
}

export interface AdvancedSearchFilters {
  enabled: boolean;
  field: string;
  displayName: string;
  filters: ReadonlyArray<KeyValueSearchFilter>;
}

export interface SearchKV {
  key: string;
  value: any;
}

export const isSearchKV = (obj: any): obj is SearchKV => {
  return obj?.key && obj.value;
};

export const isSearchKVArray = (obj: any): obj is SearchKV[] => {
  return obj && Array.isArray(obj) && obj.every(isSearchKV);
};

export type DiscoveryContentTypes =
  | string
  | 'string'
  | 'number'
  | 'date'
  | 'array'
  | 'link'
  | 'boolean'
  | 'paragraphs';

export interface MinimalFieldMapping {
  authzField: string;
  tagsListField: string;
  dataAvailabilityField?: string;
  uid: string;
}

export type RowSelectCompareFunctions = 'arrayNotEmpty' | 'alwaysTrue';

export interface SelectableRowConfiguration {
  field: string;
  comparer: RowSelectCompareFunctions;
  value?: string | number;
}

interface DiscoveryTableConfig {
  selectableRows?: boolean;
  selectableRowConfiguration?: SelectableRowConfiguration;
  expandableRows?: boolean;
  expandingRowRenderFunction?: string;
  size?: string;
}

interface DiscoveryPageTitle {
  enabled: boolean;
  text: string;
}

export interface ActionButtonConfig {
  label?: string; // label for the action button
  icon?: string; // optional icon for the action button
  requiresLogin?: boolean; // set to true if the action requires login
  tooltip?: string; // tooltip text
  disabled?: boolean;
}

export type ActionButtonType =
  | 'manifest'
  | 'zip'
  | 'download'
  | 'link'
  | 'externalLink'
  | 'exportToWorkspace'
  | 'addToDataLibrary';

export interface ExportSelectionActionButton extends ActionButtonConfig {
  type: ActionButtonType;
  params?: Record<string, unknown>;
}

export interface SearchBar {
  enabled: boolean;
  inputSubtitle: string;
  placeholder?: string;
  searchableTextFields: Array<string>;
  searchableAndSelectableTextFields: { [key: string]: string };
}

interface TagSearchDropdown {
  enabled?: boolean;
  collapsibleButtonText?: string;
  categoryTypes?: string[];
}

export interface SearchConfig {
  searchBar?: SearchBar;
  tagSearchDropdown?: TagSearchDropdown;
}

export interface ExportFromDiscoveryActions {
  buttons: ExportSelectionActionButton[];
  enabled?: boolean;
  verifyExternalLogins?: boolean;
  dataLibraryStoreMode?: DataLibraryStoreMode;
  exportDataFields: ExportDatasetFields;
}

export interface AccessFilters {
  [accessLevel: number]: boolean;
}

interface DiscoveryIndex {
  indexName: string;
}

interface DataLoader {
  dataFetchFunction?: string;
  dataFetchArgs?: JSONObject;
  sortingAndPagination?: 'client' | 'server';
}

// TODO: Type the rest of the config
export interface DiscoveryIndexConfig {
  guidType?: string;
  studyField?: string;
  maxStudies?: number;
  label?: string;
  tabType?: 'pills' | 'outline';
  features: {
    advSearchFilters?: AdvancedSearchFilters;
    aiSearch?: boolean;
    pageTitle: DiscoveryPageTitle;
    exportFromDiscovery?: ExportFromDiscoveryActions;
    search?: SearchConfig;
    authorization: DataAuthorization;
    dataLoader?: DataLoader;
    chartsSection?: CollapsableChartsPanelConfiguration;
  };
  aggregations: SummaryStatisticsConfig[];
  tags: TagsConfig;
  tableConfig: DiscoveryTableConfig;
  studyColumns: StudyColumn[];
  studyPreviewField?: StudyDetailsField;
  simpleDetailsView?: StudyPageConfig;
  detailView?: StudyDetailView;
  minimalFieldMapping: MinimalFieldMapping;
}

export interface DiscoveryConfig extends Gen3AppConfigData {
  metadataConfig: Array<DiscoveryIndexConfig>;
}

const ARBORIST_READ_PRIV = 'read';
