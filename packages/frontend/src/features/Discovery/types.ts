import {
  JSONArray,
  JSONObject,
  type MetadataPaginationParams,
} from '@gen3/core';
import DataLibraryActionButton from './ActionBar/DataLibraryActionButton';
import { SummaryStatistics, SummaryStatisticsConfig } from './Statistics/types';
import { AdvancedSearchTerms, SearchCombination } from './Search/types';

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
  discoveryConfig: DiscoveryConfig;
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
  summaryStatistics: SummaryStatistics;
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

export interface StudyPreviewField {
  name: string;
  field: string;
  contentType?: DiscoveryContentTypes;
  includeName: boolean;
  includeIfNotAvailable: boolean;
  valueIfNotAvailable?: string | number;
  detailRenderer?: string;
  params?: Record<string, unknown>;
}

export interface StudyTabField {
  type: string;
  sourceField: string;
  label: string;
  default?: string;
  renderFunction?: string;
}

export interface StudyPageGroup {
  groupName?: string;
  groupWidth?: 'half' | 'full';
  includeName?: boolean;
  fields: StudyPreviewField[];
}

export interface DataDownloadLinks {
  field: string;
  name?: string;
}

export interface DownloadLinkFields {
  idField: string;
  titleField: string;
  descriptionField: string;
}

/** Legacy config interface fro StudyPage view
 * Plan to deprecate this interface in the future
 * Please use StudyDetailView instead
 */
export interface StudyPageConfig {
  header?: {
    field: string;
  };
  downloadLinks?: DataDownloadLinks;
  downloadLinkFields?: DownloadLinkFields;
  fieldsToShow: Array<StudyPageGroup>; // render multiple groups of fields
}

export interface StudyTabTagField extends StudyTabField {
  categories?: string[];
}

export interface StudyTabGroup {
  header: string;
  fields: Array<StudyTabField | StudyTabTagField>;
}

export interface StudyDetailTab {
  tabName: string;
  groups: StudyTabGroup[];
}

export interface StudyDetailView {
  headerField: string;
  header: {
    field: string;
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

export interface DataLibraryActionButton {
  type:
    | 'manifest'
    | 'zip'
    | 'download'
    | 'link'
    | 'externalLink'
    | 'add-to-workspace';
  label?: string; // label for the action button
  icon?: string;
  requiresLogin?: boolean; // set to true if the action requires login
  tooltip?: string; // tooltip text
  actionFunction: string;
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

export interface ExportToDataLibrary {
  buttons: DataLibraryActionButton[];
  enabled?: boolean;
  verifyExternalLogins?: boolean;
  loginRequireForAllButtons?: boolean;
  manifestFieldName?: string;
}

export interface DataAuthorization {
  columnTooltip: string;
  supportedValues: Record<string, AuthorizationValues>;
  enabled: boolean;
}

export interface AccessFilters {
  [accessLevel: number]: boolean;
}

// TODO: Type the rest of the config
export interface DiscoveryConfig {
  features: {
    advSearchFilters?: AdvancedSearchFilters;
    pageTitle: DiscoveryPageTitle;
    exportToDataLibrary?: ExportToDataLibrary;
    search?: SearchConfig;
    authorization: Partial<DataAuthorization>;
    dataFetchFunction?: string;
  };
  aggregations: SummaryStatisticsConfig[];
  tagCategories: TagCategory[];
  tableConfig: DiscoveryTableConfig;
  studyColumns: StudyColumn[];
  studyPreviewField?: StudyPreviewField;
  studyPageConfig?: StudyPageConfig;
  detailView: StudyDetailView;
  minimalFieldMapping: MinimalFieldMapping;
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
  extends Record<
    string,
    JSONObject | JSONArray | AccessLevel | TagInfo[] | undefined
  > {
  [accessibleFieldName]: AccessLevel;
  tags?: Array<TagInfo>;
}
