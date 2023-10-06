export interface ColumnDefinition {
  header: string; // title of column
  accessorKey: string; // which data field to use
  className?: string; // for use with tailwind
}
