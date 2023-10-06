export interface ColumnDefinition {
  header: string; // title of column
  accessorKey: string; // which data field to use
  className?: string; // for use with tailwind
}

export interface SummaryTableColumn {
  field: string;
  title: string;
  accessorPath?: string; // JSONPath to column data
  type?: "string" | "number" | "date" | "array";
  cellRenderFunction?: string,
  width?: number; // override auto width of column
}

export interface SummaryTable {
  readonly enabled: boolean;
  readonly fields: ReadonlyArray<string>;
  readonly columns?: Record<string, SummaryTableColumn>;
}
