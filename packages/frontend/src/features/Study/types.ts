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
