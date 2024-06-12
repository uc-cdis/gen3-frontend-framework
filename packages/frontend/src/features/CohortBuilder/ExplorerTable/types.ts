import { ExplorerDetailsConfig } from './ExploreTableDetails/types';

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
