import { MRT_Row } from 'mantine-react-table';

export interface DetailRenderFunctionParams<
  TData extends Record<string, any> = Record<string, any>,
> {
  row: MRT_Row<TData>;
}

export interface ExplorerDetailsConfig {
  renderer: string;
  params?: Record<string, unknown>;
  classNames?: Record<string, string>;
  field?: string;
}

export interface DataResponse<T = Record<string, unknown>> {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  data?: T;
  error?: unknown;
}

export type DetailsDataHook = (id: string) => DataResponse;
