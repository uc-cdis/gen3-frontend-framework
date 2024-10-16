import { AdditionalDataItem, CohortItem, FileItem } from '@gen3/core';

export interface DatasetContents {
  id: string;
  name: string;
  queries: Array<CohortItem>;
  files: Array<FileItem>;
  additionalData: Array<AdditionalDataItem>;
}

export type DatalistMembers = Record<string, DatasetContents>;

export interface DataLibraryList {
  id: string;
  name: string;
  datalistMembers: DatalistMembers;
}

export type DataItemSelectedState = 'checked' | 'unchecked' | 'indeterminate';

export interface FileItemWithParentDatasetNameAndID extends FileItem {
  datasetName: string;
  datasetId: string;
}
