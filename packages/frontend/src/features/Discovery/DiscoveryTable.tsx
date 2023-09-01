import React, { useMemo, useState } from 'react';
import {
  MantineReactTable,
  MRT_Cell,
  type MRT_SortingState,
  type MRT_PaginationState,
  useMantineReactTable,
} from 'mantine-react-table';

import { jsonPathAccessor } from './utils';
import { DiscoveryTableCellRenderer } from './TableRenderers/CellRendererFactory';
import { DiscoveryTableRowRenderer } from './TableRenderers/RowRendererFactory';
import { useDiscoveryContext } from './DiscoveryProvider';
import StudyDetails from './StudyDetails/StudyDetails';
import { CellRendererFunction } from './TableRenderers/types';
import { MetadataResponse } from '@gen3/core';
import { OnChangeFn, PaginationState } from '@tanstack/table-core';
import { SortingState } from '@tanstack/table-core/src/features/Sorting';

const extractCellValue =
  (func: CellRendererFunction) =>
  ({ cell }: { cell: MRT_Cell }) =>
    func({ value: cell.getValue() as never, cell });

interface DiscoveryTableProps {
  data: MetadataResponse;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  pagination: MRT_PaginationState;
  sorting: MRT_SortingState;
  setPagination: OnChangeFn<PaginationState>;
  setSorting: OnChangeFn<SortingState>;
}

const DiscoveryTable = ({
  data,
  isError,
  isLoading,
  isFetching,
  setSorting,
  setPagination,
  pagination,
  sorting,
}: DiscoveryTableProps) => {
  const { discoveryConfig: config } = useDiscoveryContext();

  const cols = useMemo(() => {
    const studyColumns = config.studyColumns ?? [];
    return studyColumns.map((columnDef) => {
      return {
        field: columnDef.field,
        accessorKey: columnDef.field,
        header: columnDef.name,
        accessorFn: jsonPathAccessor(columnDef.field),
        Cell: columnDef?.contentType
          ? extractCellValue(
              DiscoveryTableCellRenderer(
                columnDef?.contentType,
                columnDef?.cellRenderFunction ?? 'default',
                columnDef?.params,
              ),
            )
          : extractCellValue(
              DiscoveryTableCellRenderer(
                'string',
                'default',
                columnDef?.params,
              ),
            ),
      };
    });
  }, [config]);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const table = useMantineReactTable({
    columns: cols,
    data: data?.data ?? [],
    manualSorting: true,
    manualPagination: true,
    paginateExpandedRows: false,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableRowSelection: config.tableConfig?.selectableRows ?? false,
    rowCount: data?.hits ?? 0,
    renderDetailPanel: config.studyPreviewField
      ? DiscoveryTableRowRenderer(config.studyPreviewField)
      : undefined,
    state: {
      isLoading,
      pagination,
      sorting,
      showProgressBars: isFetching,
      showAlertBanner: isError,
      expanded: config.tableConfig?.selectableRows === true ? true : undefined,
      columnVisibility: {
        'mrt-row-expand': false,
      },
    },
    layoutMode: 'semantic',
    mantineTableHeadCellProps: {
      sx: (theme) => {
        return {
          backgroundColor: theme.colors.secondary[9],
          textAlign: 'center',
          padding: theme.spacing.md,
          fontWeight: 'bold',
          fontSize: theme.fontSizes.xl,
          textTransform: 'uppercase',
        };
      },
    },
  });

  return (
    <React.Fragment>
      <StudyDetails />
      <div className="grow w-auto inline-block overflow-x-scroll">
      <MantineReactTable table={table} />
      </div>
    </React.Fragment>
  );
};

export default DiscoveryTable;
