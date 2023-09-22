import {
  JSONObject,
  type MetadataPaginationParams,
  useGetAggMDSQuery,
} from '@gen3/core';
import CartActionButton from "./ActionBar/CartActionButton";

export type DiscoveryTableDataHook = (
  arg: MetadataPaginationParams,
) => ReturnType<typeof useGetAggMDSQuery>;

export interface KeyValueSearchFilter {
  key: string;
  keyDisplayName?: string;
  valueDisplayNames?: {
    [value: string]: string;
  };
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

export interface SearchKV {
  key: string;
  value: any;
}

export interface TagCategory extends TagInfo {
  displayName: string;
  color: string;
  display: boolean;
}

export interface AggregationConfig {
  name: string;
  field: string;
  type: 'sum' | 'count';
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
  valueIfNotAvailable?: string;
  detailRenderer?: string;
  params?: Record<string, unknown>;
}

export interface StudyTabField {
  type: string;
  sourceField: string;
  label: string;
  default?: string;
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
  tabs: StudyDetailTab[];
}

interface DiscoveryTableConfig {
  selectableRows?: boolean;
  expandingRows?: boolean;
  expandingRowRenderFunction?: string;
}

interface DiscoveryPageTitle {
  enabled: boolean;
  text: string;
}


export interface CartActionButton {
  type?: "manifest" | "zip";
  label: string;  // label for the action button
  icon?: string;
  requiresLogin?: boolean; // set to true if the action requires login
  tooltip?: string; // tooltip text
  actionFunction: string;
}

export interface  ExportToCart {
  buttons: CartActionButton[];
  enabled?: boolean;
  verifyExternalLogins?: boolean;
  manifestFieldName?: string;
}


// TODO: Type the rest of the config
export interface DiscoveryConfig extends Record<string, any> {
  features: {
    advSearchFilters: AdvancedSearchFilters;
    pageTitle: DiscoveryPageTitle;
  };
  aggregations: AggregationConfig[];
  tagCategories: TagCategory[];
  tableConfig: DiscoveryTableConfig;
  studyColumns: StudyColumn[];
  studyPreviewField?: StudyPreviewField;
  detailView: StudyDetailView;
  minimalFieldMapping?: MinimalFieldMapping;
  exportToCart?: ExportToCart;
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
  extends Record<string, JSONObject | AccessLevel | TagInfo[] | undefined> {
  [accessibleFieldName]: AccessLevel;
  tags?: Array<TagInfo>;
}
