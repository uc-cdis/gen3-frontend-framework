import { AdditionalDataItem, CohortItem, FileItem } from '@gen3/core';
import { ActionsConfig } from './selection/selectedItemActions';

export interface DatasetContents {
  id: string;
  name?: string;
  queries: Array<CohortItem>;
  files: Array<FileItem>;
  additionalData: Array<AdditionalDataItem>;
}

export type DatalistMembers = Record<string, DatasetContents>;

export type DataItemSelectedState = 'checked' | 'unchecked' | 'indeterminate';

/**
 *  Used to represent a selected file item
 */
export interface FileItemWithParentDatasetNameAndID extends FileItem {
  datasetName: string;
  datasetId: string;
}

export interface DataLibraryConfig {
  useAPI: boolean;
  actions: ActionsConfig;
}

export type SelectableItem = CohortItem | FileItemWithParentDatasetNameAndID;

export interface ValidCohortItem extends CohortItem {
  valid?: boolean;
  errors?: string[];
}

export interface ValidFileItemWithParentDatasetNameAndID
  extends FileItemWithParentDatasetNameAndID {
  valid?: boolean;
  errors?: string[];
}

export type ValidatedSelectedItem =
  | ValidCohortItem
  | ValidFileItemWithParentDatasetNameAndID;
