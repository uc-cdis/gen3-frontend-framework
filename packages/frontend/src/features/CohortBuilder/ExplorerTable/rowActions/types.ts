import { MRT_Row, MRT_RowData } from 'mantine-react-table';

export type RowActionFunction = <
  T extends Record<string, unknown>,
  K extends MRT_RowData,
>(
  item: MRT_Row<K>,
  params: T,
) => void | Promise<void>;