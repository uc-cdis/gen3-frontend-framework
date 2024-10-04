import { AdditionalDataItem, CohortItem, FileItem } from '@gen3/core';

export interface DatasetContents {
  id: string;
  name: string;
  queries: Array<CohortItem>;
  files: Array<FileItem>;
  additionalData: Array<AdditionalDataItem>;
}

export type DetalistMembers = Record<string, DatasetContents>;

export interface DataLibraryList {
  id: string;
  name: string;
  datalistMembers: DetalistMembers;
}
