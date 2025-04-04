import { ExportDatasetFields } from '@gen3/core';
import { ExportFromDiscoveryActionButton } from '../types';

export interface ExportActionProps<
  T extends Record<string, any> = Record<string, any>,
> {
  selectedResources: Array<T>;
  exportDataFields: ExportDatasetFields;
}

export interface ExportActionButtonProps<
  T extends Record<string, any> = Record<string, any>,
> extends ExportActionProps<T> {
  buttonConfig: ExportFromDiscoveryActionButton;
}

export type ActionButtonFunction<
  T extends Record<string, any> = Record<string, any>,
> = (props: ExportActionProps<T>) => void;
