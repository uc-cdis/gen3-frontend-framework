import { HTTPError } from '@gen3/core';
import { ValidatedSelectedItem } from '../../DataLibrary/types';

export interface ActionButtonProps<
  T extends Record<string, any> = Record<string, any>,
> {
  selectedResources: Array<T>;
  manifestFieldName?: string;
}

export type DataActionFunction<T = void> = (
  validatedSelections: ReadonlyArray<ValidatedSelectedItem>,
  params?: Record<string, any>, // function options from the config
  done?: (arg0?: string) => void,
  onError?: (error: HTTPError | Error) => void,
  onAbort?: () => void,
  signal?: AbortSignal,
) => Promise<T>;
