// Adapted from:
// gen3-frontend-framework/packages/frontend/src/features/Discovery/Statistics/types.ts
// gen3-frontend-framework/packages/frontend/src/features/Discovery/types.ts

import {
  type AggregationsData,
  DataLibraryStoreMode,
  type ExportDatasetFields,
  type MetadataPaginationParams,
} from '@gen3/core';
import { AccessLevel, DataAuthorization } from '@gen3/frontend/utils';
import { JSONValue, JSONObject } from '@gen3/core';
import { accessibleFieldName } from '@gen3/frontend/utils';
import { CollapsableChartsPanelConfiguration } from '@gen3/frontend/components/charts/types';
import { Gen3AppConfigData } from '@gen3/frontend/lib/content/types';

interface KeywordSearch {
  keywords?: string[];
  operator: SearchCombination;
}
export type SearchFilterState = Record<string, Record<string, boolean>>;
export enum SearchCombination {
  and = 'AND',
  or = 'OR',
}

export interface AdvancedSearchTerms {
  operation: SearchCombination;
  filters: SearchFilterState;
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
export type SummaryStatistics = Array<SummaryStatisticsDisplayData>;
export interface SummaryStatisticsDisplayData extends SummaryStatisticsConfig {
  value: any; // The value of the aggregation
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

export interface selectedTags {
  [key: string]: boolean;
}

export interface SearchKV {
  key: string;
  value: any;
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
}

interface DiscoveryPageTitle {
  enabled: boolean;
  text: string;
}

export interface StudyDetailsField {
  name: string;
  field: string;
  contentType?: string;
  includeLabel?: boolean;
  includeIfNotAvailable?: boolean;
  valueIfNotAvailable?: string | number;
  renderer?: string;
  params?: Record<string, unknown>;
  classNames?: Record<string, string>;
}

export interface StudyPageGroup {
  groupName?: string;
  groupWidth?: 'half' | 'full';
  fields: StudyDetailsField[];
}

export interface StudyPageConfig {
  showAllAvailableFields?: boolean;
  header?: {
    field: string;
    className?: string;
  };
  downloadLinks?: DataDownloadLinks;
  downloadLinkFields?: DownloadLinkFields;
  classNames?: Record<string, string>;
  fieldsToShow: Array<StudyPageGroup>; // render multiple groups of fields
}

export interface StudyColumn {
  name: string;
  field: string;
  contentType?: StudyColumnContentTypes;
  cellRenderFunction?: string;
  params?: JSONObject;
  errorIfNotAvailable?: boolean;
  valueIfNotAvailable?: string | number;
}

export type StudyColumnContentTypes =
  | string
  | 'string'
  | 'number'
  | 'date'
  | 'array'
  | 'link'
  | 'boolean'
  | 'paragraphs';

export interface DataDownloadLinks {
  field: string;
  name?: string;
  className?: Record<string, string>;
}

export interface DownloadLinkFields {
  idField: string;
  titleField: string;
  descriptionField: string;
}

export interface StudyTabTagField extends StudyDetailsField {
  categories?: string[];
}

export interface StudyTabGroup {
  header: string;
  fields: Array<StudyDetailsField | StudyTabTagField>;
}

export interface StudyDetailTab {
  tabName: string;
  groups: StudyTabGroup[];
}

export interface StudyDetailView {
  header: {
    field: string;
    className?: string;
  };
  tabs: StudyDetailTab[];
}

export interface TagData {
  name: string;
  category: string;
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

export interface TagCategory extends TagInfo {
  displayName: string;
  color: string;
  display: boolean;
}

export interface TagsConfig {
  tagCategories: TagCategory[];
  showUnknownTags?: boolean;
}

export interface StudyResource extends Record<
  string,
  JSONValue | AccessLevel | TagInfo[] | undefined
> {
  [accessibleFieldName]?: AccessLevel;
  tags?: Array<TagInfo>;
}

export interface StudyDetailTab {
  tabName: string;
  groups: StudyTabGroup[];
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

interface DataLoader {
  dataFetchFunction?: string;
  dataFetchArgs?: JSONObject;
  sortingAndPagination?: 'client' | 'server';
}

export interface StudyDetailView {
  header: {
    field: string;
    className?: string;
  };
  tabs: StudyDetailTab[];
}

export interface SummaryStatisticsConfig {
  name: string; // The name of the aggregation
  field: string; // Points to the field in the data
  type: 'sum' | 'count'; // The type of aggregation
  displayFunction?: string; // The display function to use
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
  detailView: StudyDetailView;
  minimalFieldMapping: MinimalFieldMapping;
}

export interface DiscoveryConfig extends Gen3AppConfigData {
  metadataConfig: Array<DiscoveryIndexConfig>;
}
