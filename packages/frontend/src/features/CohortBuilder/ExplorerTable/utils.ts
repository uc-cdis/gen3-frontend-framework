import { fieldNameToTitle } from '@gen3/core';
import type {
  CellRendererFunctionProps,
  ColumnDefinition,
  SummaryTableColumn,
  TableColumnsAndFields,
  ExplorerColumn,
} from './types';
import { type MRT_Column } from 'mantine-react-table';
import { ExplorerTableCellRendererFactory } from './ExplorerTableCellRenderers';
import { jsonPathAccessor } from '../../../components/Tables/utils';

export const convertGuppyTableConfig = (
  config: ReadonlyArray<SummaryTableColumn>,
): ColumnDefinition[] => {
  // convert the config to the format that guppy table expects
  return config.map((column: SummaryTableColumn) => {
    return {
      header: column.title ?? fieldNameToTitle(column.field),
      accessorKey: column.field,
    };
  });
};

export const isRecordAny = (obj: unknown): obj is Record<string, any> => {
  if (Array.isArray(obj)) return false;

  return obj !== null && typeof obj === 'object';
};

export const createTableColumns = (tableConfig: TableColumnsAndFields) => {
  return tableConfig.fields.map((field) => {
    const columnDef = tableConfig?.columns?.[field];

    const cellRendererFunc = columnDef?.type
      ? ExplorerTableCellRendererFactory().getRenderer(
          columnDef?.type,
          columnDef?.cellRenderFunction ?? 'default',
        )
      : undefined;

    const cellRendererFuncParams =
      columnDef?.params && isRecordAny(columnDef?.params)
        ? columnDef?.params
        : {};
    return {
      id: field,
      field: field,
      accessorKey: field as never,
      header: columnDef?.title ?? fieldNameToTitle(field),
      accessorFn: columnDef?.accessorPath
        ? jsonPathAccessor(columnDef.accessorPath)
        : undefined,
      Cell:
        cellRendererFunc && columnDef?.params
          ? (cell: CellRendererFunctionProps) =>
              cellRendererFunc(cell, cellRendererFuncParams)
          : cellRendererFunc
            ? cellRendererFunc
            : undefined,

      size: columnDef?.width,
      enableSorting: columnDef?.sortable ?? undefined,
    };
  }, [] as MRT_Column<ExplorerColumn>[]);
};
