'use client';
import React, { useMemo } from 'react';
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
import { JSONObject, MetadataResponse } from '@gen3/core';
import { OnChangeFn, PaginationState, SortingState } from '@tanstack/table-core';

const extractCellValue =
  (func: CellRendererFunction) =>
  ({ cell }: { cell: MRT_Cell }) =>
    func({ value: cell.getValue() as never, cell });

interface DiscoveryTableProps {
  data: JSONObject[];
  hits: number,
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
  hits,
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
    data: data ?? [],
    manualSorting: true,
    manualPagination: true,
    paginateExpandedRows: false,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableRowSelection: config.tableConfig?.selectableRows ?? false,
    rowCount: hits,
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
     // TODO expand to highlight row/detail row on hover
    // mantineTableBodyRowProps: {
    //   onMouseEnter: (row) => {
    //     console.log('mouse enter', row);
    //   },
    //   sx: {
    //     "&:hover td": {
    //       backgroundColor: "#FF0000",
    //     }
    // }},
    layoutMode: 'semantic',
    mantineTableHeadCellProps: {
      sx: (theme) => {
        return {
          backgroundColor: theme.colors.accent[8],
          color: theme.colors.accent[0],
          textAlign: 'center',
          padding: theme.spacing.md,
          fontWeight: 'bold',
          fontSize: theme.fontSizes.xl,
          textTransform: 'uppercase',
        };
      },
    },
    mantineTableProps: {
      sx: (theme) => {
        return {
          backgroundColor: theme.colors.base[9],
        };
      }
    }
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
