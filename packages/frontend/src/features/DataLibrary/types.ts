import { AdditionalDataItem, CohortItem, FileItem } from '@gen3/core';

export interface DatasetContents {
  id: string;
  name: string;
  queries: CohortItem[];
  files: FileItem[];
  additionalData: Array<AdditionalDataItem>;
}

export interface DataLibraryList {
  id: string;
  name: string;
  datasetItems: Array<DatasetContents>;
}
