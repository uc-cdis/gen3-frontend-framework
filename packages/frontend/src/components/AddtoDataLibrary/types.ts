import { DataLibraryStoreMode, ExportDatasetFields } from '@gen3/core';
import { StyleSize, StylingOverride } from '../../types';

export interface ExportActionProps<
  T extends Record<string, any> = Record<string, any>,
> {
  selectedResources: Array<T>;
  exportDataFields: ExportDatasetFields;
  verifyExternalLogins?: boolean;
  dataLibraryStoreMode?: DataLibraryStoreMode;
}

export interface ButtonConfiguration {
  label?: string; // label for the action button
  icon?: string;
  requiresLogin?: boolean; // set to true if the action requires login
  tooltip?: string; // tooltip text
  disabled?: boolean;
}

export interface ExportActionButtonProps<
  T extends Record<string, any> = Record<string, any>,
> extends ExportActionProps<T> {
  buttonConfig: ButtonConfiguration;
  classNames?: StylingOverride;
  size?: StyleSize;
}

export type ActionButtonFunction<
  T extends Record<string, any> = Record<string, any>,
> = (props: ExportActionProps<T>) => void;
