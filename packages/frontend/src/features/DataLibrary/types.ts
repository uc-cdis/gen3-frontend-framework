import {
  AdditionalDataItem,
  CohortItem,
  FileItem,
  DataLibraryStoreMode,
} from '@gen3/core';
import { DataLibraryActionsConfig } from './selection/types';

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

export interface TableColumnsConfig {
  label: string;
  accessor: string;
  width?: string | number;
}

export interface DataLibraryConfig {
  storageMode: DataLibraryStoreMode;
  requiresLogin?: boolean;
  size?: string;
  actions: DataLibraryActionsConfig;
  fileTable?: {
    columns: TableColumnsConfig[];
  };
  selectionTable?: {
    columns: TableColumnsConfig[];
  };
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

/**
 * Type guard for ValidFileItemWithParentDatasetNameAndID
 * Checks if the object has the properties that define this interface
 */
export const isValidFileItemWithParentDatasetNameAndID = (
  item: unknown,
): item is ValidFileItemWithParentDatasetNameAndID => {
  if (!item || typeof item !== 'object') {
    return false;
  }

  const fileItem = item as Partial<ValidFileItemWithParentDatasetNameAndID>;

  // Check required properties from FileItemWithParentDatasetNameAndID
  if (
    typeof fileItem.datasetName !== 'string' ||
    typeof fileItem.datasetId !== 'string'
  ) {
    return false;
  }

  // We can assume it's a FileItem if it has the required properties from parent interfaces
  // Additional checks could be added if FileItem has required properties

  return true;
};

export const MantineSizeToString: Record<string, string> = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
  'xl-2': 'xl-2',
};

export const IconSize: Record<string, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  'xl-2': 36,
};

export const FontSize: Record<string, string> = {
  xs: 'var(--mantine-font-size-xs)',
  sm: 'var(--mantine-font-size-sm)',
  md: 'var(--mantine-font-size-md)',
  lg: 'var(--mantine-font-size-lg)',
  xl: 'var(--mantine-font-size-xl)',
  'xl-2': 'var(--mantine-font-size-2xl)',
};
