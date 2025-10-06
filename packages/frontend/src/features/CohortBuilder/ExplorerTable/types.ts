import { ExplorerDetailsConfig } from './ExploreTableDetails/types';
import {
  MRT_Cell,
  MRT_Column,
  MRT_Row,
  MRT_RowData,
  MRT_TableInstance,
} from 'mantine-react-table';
import {
  Accessibility,
  JSONObject,
  RawDataAndTotalCountsParams,
  useGetRawDataAndTotalCountsQuery,
} from '@gen3/core';
import React, { ReactNode, RefObject } from 'react';

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
  lockVisible?: boolean; // lock the visibility of this column to the value of visible (if set)
}

export interface SummaryTablePageLimit {
  limit?: number; // default number of total items to page through
  label?: string; // message to display next to pagination controls
}

export interface TableColumnsAndFields {
  fields: ReadonlyArray<string>;
  columns: Record<string, SummaryTableColumn>;
}

export interface FieldSubtableClassnames extends Record<string, string> {
  header: string;
  columnLabel: string;
}

export interface FieldSubtable extends TableColumnsAndFields {
  root: string;
  label: string;
  classNames?: Partial<FieldSubtableClassnames>;
}

export interface RowSelectionConfiguration {
  enabled?: boolean;
  action: 'library' | 'cart';
  idField?: string;
  itemFields: ReadonlyArray<string>;
}

export interface SummaryTable extends TableColumnsAndFields {
  enabled: boolean;
  subTables?: ReadonlyArray<FieldSubtable>;
  pageLimit?: SummaryTablePageLimit;
  detailsConfig?: ExplorerDetailsConfig;
  selectableRowsConfiguration?: RowSelectionConfiguration;
  showTableHeaderControls?: boolean;
  columnSorting?: boolean;
  columnHiding?: boolean;
  rowIdField?: string;
}

export interface ExploreTableClassnames extends Record<string, string> {
  root: string;
  label: string;
  header: string;
  columnLabel: string;
}

export interface ExplorerTableProps {
  index: string; // guppy index this table is for
  tableConfig: Readonly<SummaryTable>; // config for the table
  accessibility: Accessibility;
  size?: string;
  classNames?: Partial<ExploreTableClassnames>;
  additionalControls?: React.ReactNode; // for customization
  tableTotalDetail?: React.ReactNode;
  tableTitle?: React.ReactNode;
  indexPrefix?: string;
  dataHook?: ExplorerDataQueryHook;
}

export interface ExplorerTableColumnMRT {
  id: string;
  field: string;
  accessorKey: never;
  header: string;
  accessorFn?: (originalRow: JSONObject) => any;
  Cell?: ((cell: CellRendererFunctionProps) => React.ReactNode) | undefined;
  size?: number;
  enableSorting?: boolean;
  visible?: boolean;
  lockVisible?: boolean;
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

export type CellRendererFunction = (
  props: CellRendererFunctionProps,
  ...args: any[]
) => ReactNode;

export type ExplorerDataQueryHook = (
  args: RawDataAndTotalCountsParams,
) => ReturnType<typeof useGetRawDataAndTotalCountsQuery>;
