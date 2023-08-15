import { JSONObject, type MetadataPaginationParams, useGetAggMDSQuery } from '@gen3/core';

export type DiscoveryTableDataHook = (arg: MetadataPaginationParams) => ReturnType<typeof useGetAggMDSQuery>;

export interface AdvancedSearchFilters {
  enabled: boolean;
  field: string;
  displayName: string;
  filters: {
    key: string;
  }[];
}

export interface TagCategory {
  name: string;
  displayName: string;
  color: string;
  display: boolean;
}

export type DiscoveryContentTypes = 'string' | 'number' | 'date' | 'array' | 'link' | 'boolean' | 'paragraphs';

export interface StudyColumn {
  name: string;
  field: string;
  contentType?: DiscoveryContentTypes
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

export interface StudyPreviewField  {
  name: string;
  field: string;
  contentType?: DiscoveryContentTypes
  includeName: boolean;
  includeIfNotAvailable: boolean;
  valueIfNotAvailable?: string;
  detailRenderer?: string;
  params?: Record<string, unknown>;
}

export interface StudyTabField {
  type: string;
  sourceField: string;
  label?: string;
  default?: string;
}

export interface StudyTabGroup {
  header: string;
  fields: StudyTabField[];
}

interface StudyDetailTab {
  tabName: string;
  groups: StudyTabGroup[];
}

interface StudyDetailView {
  headerField: string;
  tabs: StudyDetailTab[];
}

interface DiscoveryTableConfig {
  expandingRows?: boolean;
  expandingRowRenderFunction?: string;
}

// TODO: Type the rest of the config
export interface DiscoveryConfig extends Record<string, any> {
  advSearchFilters: AdvancedSearchFilters;
  tagCategories: TagCategory[];
  tableConfig: DiscoveryTableConfig;
  studyColumns: StudyColumn[];
  studyPreviewField?: StudyPreviewField;
  detailView: StudyDetailView;
  minimalFieldMapping?: MinimalFieldMapping;
}
