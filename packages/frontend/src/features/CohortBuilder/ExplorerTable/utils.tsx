import { fieldNameToTitle } from '@gen3/core';
import {
  CellRendererFunctionProps,
  ColumnDefinition,
  ExplorerColumn,
  ExplorerTableColumnMRT,
  SummaryTableColumn,
  TableColumnsAndFields,
} from './types';
import { type MRT_Column } from 'mantine-react-table';
import { ExplorerTableCellRendererFactory, RenderArrayCellSimple, } from './ExplorerTableCellRenderers';
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

export const createTableColumns = (tableConfig: TableColumnsAndFields) => {
  const tableColumns = tableConfig.fields.map((field) => {
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
            : (cell: CellRendererFunctionProps) =>
                RenderArrayCellSimple(cell, tableConfig?.defaultIfEmpty),

      size: columnDef?.width,
      enableSorting: columnDef?.sortable ?? undefined,
      visible: columnDef?.visible ?? true,
      lockVisible: columnDef?.lockVisible ?? false,
    };
  });

  const lockedVisibility = tableConfig.fields.reduce(
    (acc, field) => {
      const columnDef = tableConfig?.columns?.[field];
      if (columnDef && columnDef?.lockVisible) {
        acc[field] = columnDef?.visible ?? true; // assume visible by default
      }
      return acc;
    },
    { 'mrt-row-actions': true } as Record<string, boolean>,
  );

  return {
    tableColumns: tableColumns,
    lockedVisibility: lockedVisibility,
  };
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
            : (cell: CellRendererFunctionProps) =>
                RenderArrayCellSimple(cell, tableConfig?.defaultIfEmpty),

      size: columnDef?.width,
      enableSorting: columnDef?.sortable ?? undefined,
    };
  }, [] as MRT_Column<ExplorerColumn>[]);
};
