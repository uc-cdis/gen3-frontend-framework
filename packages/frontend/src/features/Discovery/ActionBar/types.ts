import { ExportDataFields, ExportFromDiscoveryActionButton } from '../types';

export interface ExportActionProps<
  T extends Record<string, any> = Record<string, any>,
> {
  selectedResources: Array<T>;
  exportDataFields: ExportDataFields;
}

export interface ExportActionButtonProps<
  T extends Record<string, any> = Record<string, any>,
> extends ExportActionProps<T> {
  buttonConfig: ExportFromDiscoveryActionButton;
}

export type ActionButtonFunction<
  T extends Record<string, any> = Record<string, any>,
> = (props: ExportActionProps<T>) => void;
