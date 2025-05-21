import {
  JSONValue,
  JSONObject,
  type MetadataPaginationParams,
  type AggregationsData,
  type ExportDatasetFields,
  DataLibraryStoreMode,
} from '@gen3/core';

import { SummaryStatistics, SummaryStatisticsConfig } from './Statistics/types';
import { AdvancedSearchTerms, SearchCombination } from './Search/types';
import { SummaryChart } from '../../components/charts/types';
import { StudyPageGroup, StudyPageConfig, StudyDetailsField, StudyColumn, StudyDetailView } from '../Study/types';
import { AccessibleResource, DataAuthorization } from '../../utils';

export interface TagData {
  name: string;
  category: string;
}

interface KeywordSearch {
  keywords?: string[];
  operator: SearchCombination;
}

export interface SearchTerms {
  keyword: KeywordSearch;
  advancedSearchTerms: AdvancedSearchTerms;
  selectedTags?: Record<string, boolean>;
}

export interface DiscoveryDataLoaderProps extends Record<string, any> {
  pagination: MetadataPaginationParams;
  searchTerms: SearchTerms;
  discoveryConfig: DiscoveryIndexConfig;
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
  advancedSearchFilterValues: ReadonlyArray<KeyValueSearchFilter>;
  dataRequestStatus: DataRequestStatus;
  summaryStatistics: SummaryStatistics; // counts and sums
  charts: AggregationsData; // bucket counts for charts
  suggestions: Array<string>;
  clearSearch?: () => void;
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

export interface TagInfo {
  name: string;
  category: string;
}

export const isTagInfo = (obj: any): obj is TagInfo => {
  return obj && obj.name && obj.category;
};

export const isTagInfoArray = (obj: any): obj is TagInfo[] => {
  return obj && Array.isArray(obj) && obj.every(isTagInfo);
};

export interface SearchKV {
  key: string;
  value: any;
}

export const isSearchKV = (obj: any): obj is SearchKV => {
  return obj && obj.key && obj.value;
};

export const isSearchKVArray = (obj: any): obj is SearchKV[] => {
  return obj && Array.isArray(obj) && obj.every(isSearchKV);
};

export interface TagCategory extends TagInfo {
  displayName: string;
  color: string;
  display: boolean;
}

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
  tagsListFieldName: string;
  dataAvailabilityField: string;
  uid: string;
}

interface DiscoveryTableConfig {
  selectableRows?: boolean;
  expandableRows?: boolean;
  expandingRowRenderFunction?: string;
}

interface DiscoveryPageTitle {
  enabled: boolean;
  text: string;
}

export interface ExportFromDiscoveryActionButton {
  type:
    | 'manifest'
    | 'zip'
    | 'download'
    | 'link'
    | 'externalLink'
    | 'addToDataLibrary';
  label?: string; // label for the action button
  icon?: string;
  requiresLogin?: boolean; // set to true if the action requires login
  tooltip?: string; // tooltip text
  disabled?: boolean;
}

export interface SearchBar {
  enabled: boolean;
  inputSubtitle: string;
  placeholder?: string;
  searchableTextFields: Array<string>;
}

interface TagSearchDropdown {
  enabled?: boolean;
  collapsibleButtonText?: string;
}

export interface SearchConfig {
  searchBar?: SearchBar;
  tagSearchDropdown?: TagSearchDropdown;
}

export interface ExportFromDiscoveryActions {
  buttons: ExportFromDiscoveryActionButton[];
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

export interface TagsConfig {
  tagCategories: TagCategory[];
  showUnknownTags?: boolean;
}

interface SummaryChartWithField extends SummaryChart {
  field: string;
}

export interface ChartsSection {
  enabled: boolean;
  title?: string;
  showLegends?: {
    enabled: boolean;
    showSwitch?: boolean;
  };
  charts?: Record<string, SummaryChartWithField>;
}

// TODO: Type the rest of the config
export interface DiscoveryIndexConfig {
  guidType?: string;
  studyField?: string;
  label?: string;
  features: {
    advSearchFilters?: AdvancedSearchFilters;
    aiSearch?: boolean;
    pageTitle: DiscoveryPageTitle;
    exportFromDiscovery?: ExportFromDiscoveryActions;
    search?: SearchConfig;
    authorization: DataAuthorization;
    dataLoader?: DataLoader;
    chartsSection?: ChartsSection;
  };
  aggregations: SummaryStatisticsConfig[];
  tags: TagsConfig;
  tableConfig: DiscoveryTableConfig;
  studyColumns: StudyColumn[];
  studyPreviewField?: StudyDetailsField;
  simpleDetailsView?: StudyPageConfig;
  detailView: StudyDetailView;
  minimalFieldMapping: MinimalFieldMapping;
}

export interface DiscoveryConfig {
  metadataConfig: Array<DiscoveryIndexConfig>;
}

const ARBORIST_READ_PRIV = 'read';

export interface DiscoveryResource extends AccessibleResource {
  tags?: Array<TagInfo>;
}
