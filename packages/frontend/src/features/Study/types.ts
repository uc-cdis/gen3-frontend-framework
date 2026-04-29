import { JSONObject, JSONValue } from '@gen3/core';
import { accessibleFieldName, AccessLevel } from '../../utils';

export interface StudyDetailsField {
  name: string;
  field: string;
  label?: string; // Optional label for the field
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
  showSubmitButton?: boolean;
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
  headerField: string;
  subHeaderField: string;
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
