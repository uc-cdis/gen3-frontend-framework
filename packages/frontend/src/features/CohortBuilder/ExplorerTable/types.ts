import { ExplorerDetailsConfig } from './ExploreTableDetails/types';
import {
  MRT_Cell,
  MRT_Column,
  MRT_Row,
  MRT_TableInstance,
  MRT_RowData,
} from 'mantine-react-table';
import { JSONObject } from '@gen3/core';
import { ReactNode, RefObject } from 'react';

export interface ColumnDefinition {
  header: string; // title of column
  accessorKey: string; // which data field to use
  className?: string; // for use with tailwind
}

export type SummaryTableColumnType =
  | 'string'
  | 'number'
  | 'date'
  | 'array'
  | 'link'
  | 'boolean'
  | 'paragraphs';

export interface SummaryTableColumn {
  field: string; // field name
  title: string; // column title
  accessorPath?: string; // JSONPath to column data
  type?: SummaryTableColumnType; // type of column data
  cellRenderFunction?: string; // name of cell renderer function
  params?: Record<string, any>; // additional parameters for cell renderer
  width?: number; // override auto width of column
  sortable?: boolean; // enable sorting on this column
  visible?: boolean; // show/hide column
}

export interface SummaryTablePageLimit {
  readonly limit?: number; // default number of total items to page trough
  readonly label?: string; // message to display next to pagination controls
}

export interface SummaryTable {
  readonly enabled: boolean;
  readonly fields: ReadonlyArray<string>;
  readonly columns?: Record<string, SummaryTableColumn>;
  readonly pageLimit?: SummaryTablePageLimit;
  readonly detailsConfig?: ExplorerDetailsConfig;
  readonly selectableRows?: boolean;
}

export interface ExplorerTableProps {
  index: string;
  tableConfig: SummaryTable;
}

/**
 * Represents the props required for a cell renderer function.
 */
export interface CellRendererFunctionProps<T extends MRT_RowData = JSONObject> {
  cell: MRT_Cell<T>;
  renderedCellValue: ReactNode;
  column: MRT_Column<T>;
  row: MRT_Row<T>;
  rowRef?: RefObject<HTMLTableRowElement> | undefined;
  table: MRT_TableInstance<T>;
  params?: Record<string, unknown>;
}
