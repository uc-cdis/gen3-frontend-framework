import { AdditionalDataItem, CohortItem, FileItem } from '@gen3/core';

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
  useAPI: boolean;
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

export const getNextSize = <T>(
  currentSize: keyof Record<string, T>,
  sizeMap: Record<string, T>,
): T => {
  // Get all keys in order
  const sizes = Object.keys(sizeMap);

  // Find the current index
  const currentIndex = sizes.indexOf(currentSize);

  // If current size not found, return the first size
  if (currentIndex === -1) {
    return sizeMap[sizes[0]];
  }

  // If we're at or past the last size, return the last size value
  if (currentIndex >= sizes.length - 1) {
    return sizeMap[sizes[sizes.length - 1]];
  }

  // Return the value of the next size
  const nextSize = sizes[currentIndex + 1];
  return sizeMap[nextSize];
};
