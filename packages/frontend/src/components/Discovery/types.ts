
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

export interface StudyColumn {
  name: string;
  field: string;
  contentType?: 'string' | 'number' | 'date' | 'array' | 'link';
  cellRenderFunction?: string;
  params?: Record<string, unknown>;
  errorIfNotAvailable?: boolean;
  valueIfNotAvailable?: string | number;
}

interface StudyPreviewField extends StudyColumn {
  includeName: boolean;
  includeIfNotAvailable: boolean,
}

interface StudyTabField {
  type: string;
  sourceField: string;
  label?: string;
  default?: string;
}

interface StudyTabGroup {
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
  studyPreviewField: StudyPreviewField;
  detailView: StudyDetailView;
}
