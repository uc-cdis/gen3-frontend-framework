import { ExplorerDetailsConfig } from './ExploreTableDetails/types';
import {
  MRT_Cell,
  MRT_Column,
  MRT_Row,
  MRT_RowData,
  MRT_TableInstance,
} from 'mantine-react-table';
import { JSONObject } from '@gen3/core';
import { ReactNode, RefObject } from 'react';
import { CellRendererFunction } from './ExplorerTableCellRenderers';

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
  width?: number; // override auto width of the column
  sortable?: boolean; // enable sorting on this column
  visible?: boolean; // show/hide column
}

export interface SummaryTablePageLimit {
  limit?: number; // default number of total items to page through
  label?: string; // message to display next to pagination controls
}

export interface TableColumnsAndFields {
  fields: ReadonlyArray<string>;
  columns: Record<string, SummaryTableColumn>;
}

export interface FieldSubtable extends TableColumnsAndFields {
  root: string;
  label: string;
}

export interface SummaryTable extends TableColumnsAndFields {
  enabled: boolean;
  subTables?: ReadonlyArray<FieldSubtable>;
  pageLimit?: SummaryTablePageLimit;
  detailsConfig?: ExplorerDetailsConfig;
  selectableRows?: boolean;
}

export interface ExplorerTableProps {
  index: string; // guppy index this table is for
  tableConfig: Readonly<SummaryTable>; // config for the table
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

export interface ExplorerColumn {
  field: string;
  accessorKey: never;
  header: string;
  accessorFn?: (originalRow: ExplorerColumn) => any;
  Cell?: CellRendererFunction;
  size?: number;
}
