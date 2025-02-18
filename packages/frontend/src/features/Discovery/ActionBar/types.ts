import { ExportDataFields } from '../types';

export interface ActionButtonProps<
  T extends Record<string, any> = Record<string, any>,
> {
  selectedResources: Array<T>;
  exportDataFields: ExportDataFields;
}

export type ActionButtonFunction<
  T extends Record<string, any> = Record<string, any>,
> = (props: ActionButtonProps<T>) => void;
