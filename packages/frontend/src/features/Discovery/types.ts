import { JSONObject, JSONValue } from '@gen3/core';
import DataLibraryActionButton from './ActionBar/DataLibraryActionButton';
import { SummaryStatisticsConfig } from '../metadata/Statistics/types';
import { AdvancedSearchTerms, SearchCombination } from './Search/types';
import {
  MetadataHookResponse,
  MetadataLoaderConfig,
  MetadataLoaderProps,
} from '../metadata/DataLoaders/types';

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

export type DiscoveryTableDataHook = (
  dataHookArgs: MetadataLoaderProps,
  ...args: any[]
) => MetadataHookResponse;

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

export interface TagsConfig {
  tagCategories: TagCategory[];
  showUnknownTags?: boolean;
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
    exportToDataLibrary?: ExportToDataLibrary;
    search?: SearchConfig;
    authorization: DataAuthorization;
    dataLoader?: MetadataLoaderConfig;
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
