import { fieldNameToTitle } from '@gen3/core';
import type {
  CellRendererFunctionProps,
  ColumnDefinition,
  SummaryTableColumn,
  TableColumnsAndFields,
  ExplorerColumn,
  ExplorerTableColumnMRT,
} from './types';
import { type MRT_Column } from 'mantine-react-table';
import {
  ExplorerTableCellRendererFactory,
  RenderArrayCell,
} from './ExplorerTableCellRenderers';
import { jsonPathAccessor } from '../../../components/Tables/utils';
import { ArrayCellRenderer } from './ArrayCellRenderer';

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

export const createTableColumns = (
  tableConfig: TableColumnsAndFields,
): ExplorerTableColumnMRT[] => {
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

export const createArrayTableColumns = (
  root: string,
  tableConfig: TableColumnsAndFields,
): ExplorerTableColumnMRT[] => {
  return tableConfig.fields.map((field) => {
    const columnDef = tableConfig?.columns?.[field];

    const cellRendererFunc = columnDef?.type
      ? ExplorerTableCellRendererFactory().getRenderer(
          columnDef?.type,
          columnDef?.cellRenderFunction ?? 'default',
        )
      : undefined;

    const dataPath = `${root}[*].${field}`;

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
              ArrayCellRenderer(cellRendererFunc, cell, cellRendererFuncParams)
          : cellRendererFunc
            ? (cell: CellRendererFunctionProps) =>
                ArrayCellRenderer(cellRendererFunc, cell)
            : RenderArrayCell,

      size: columnDef?.width,
      enableSorting: columnDef?.sortable ?? undefined,
    };
  }, [] as MRT_Column<ExplorerColumn>[]);
};
