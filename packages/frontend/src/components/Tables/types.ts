//  Configure Gen3 Table Columns
export interface Gen3TableColumn {
  field: string;
  title: string;
  accessorPath?: string;
  type?: 'string' | 'number' | 'date' | 'array' | 'link';
  cellRenderFunction?: string;
  params?: Record<string, unknown>;
  width?: number;
  errorIfNotAvailable?: boolean;
  valueIfNotAvailable?: string | number;
}
