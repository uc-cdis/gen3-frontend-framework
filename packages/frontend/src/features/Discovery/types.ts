import {
  JSONValue,
  JSONObject,
  type MetadataPaginationParams,
  type AggregationsData,
} from '@gen3/core';
import DataLibraryActionButton from './ActionBar/DataLibraryActionButton';
import { SummaryStatistics, SummaryStatisticsConfig } from './Statistics/types';
import { AdvancedSearchTerms, SearchCombination } from './Search/types';
import { SummaryChart } from '../../components/charts/types';

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

export interface StudyColumn {
  name: string;
  field: string;
  contentType?: DiscoveryContentTypes;
  cellRenderFunction?: string;
  params?: JSONObject;
  errorIfNotAvailable?: boolean;
  valueIfNotAvailable?: string | number;
}

export interface MinimalFieldMapping {
  authzField: string;
  tagsListFieldName: string;
  dataAvailabilityField: string;
  uid: string;
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
    | 'add-to-workspace'
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

export interface AuthorizationValues {
  enabled: boolean;
  menuText: string;
}

export interface ExportDataFields {
  dataObjectFieldName: string; // member that stores the id of the object that stores the id.
  datesetIdFieldName: string; // member that stores the id of the "dataset" will default to uid
  dataObjectIdField: string; // field in data object
}

export interface ExportFromDiscoveryActions {
  buttons: ExportFromDiscoveryActionButton[];
  enabled?: boolean;
  verifyExternalLogins?: boolean;
  exportDataFields: ExportDataFields;
}

export interface DataAuthorization {
  columnTooltip?: string;
  supportedValues?: Record<string, AuthorizationValues>;
  enabled?: boolean;
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

export interface UserAuthMapping {
  service: string;
  method: string;
}

export const accessibleFieldName = '__accessible';
const ARBORIST_READ_PRIV = 'read';

export enum AccessLevel {
  ACCESSIBLE = 1,
  UNACCESSIBLE = 2,
  PENDING = 3,
  NOT_AVAILABLE = 4,
  OTHER = 5,
}

export interface DiscoveryResource
  extends Record<string, JSONValue | AccessLevel | TagInfo[] | undefined> {
  [accessibleFieldName]?: AccessLevel;
  tags?: Array<TagInfo>;
}
