import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { CrosswalkMapping } from './types';
import React, { useMemo } from 'react';
import { LoadingOverlay } from '@mantine/core';

interface CrosswalkTableProps {
  mapping: CrosswalkMapping;
  data: Array<any>;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
}

const CrosswalkTable = ({
  mapping,
  data,
  isFetching,
  isError,
}: CrosswalkTableProps) => {
  const cols = useMemo(() => {
    return [
      {
        field: mapping.source.id,
        accessorKey: mapping.source.id,
        header: mapping.source.name,
      },

      ...mapping.external.map((columnDef) => {
        return {
          field: columnDef.id,
          accessorKey: columnDef.id,
          header: columnDef.name,
        };
      }),
    ];
  }, []);

  const table = useMantineReactTable({
    columns: cols as any[],
    data: data,
    manualSorting: true,
    manualPagination: true,
    paginateExpandedRows: false,
    rowCount: data.length,
    enableTopToolbar: false,
    state: {
      isLoading: isFetching,
      showProgressBars: isFetching,
      showAlertBanner: isError,
      columnVisibility: {
        'mrt-row-expand': false,
      },
    },
    layoutMode: 'semantic',
    mantineTableHeadCellProps: {
      sx: (theme) => {
        return {
          backgroundColor: theme.colors.table[1],
          color: theme.colors.table[5],
          textAlign: 'center',
          padding: theme.spacing.md,
          fontWeight: 'bold',
          fontSize: theme.fontSizes.lg,
          textTransform: 'uppercase',
        };
      },
    },
    mantineTableProps: {
      sx: (theme) => {
        return {
          backgroundColor: theme.colors.base[1],
        };
      },
    },
  });

  return (
    <div className="grow w-auto inline-block overflow-x-scroll">
      <LoadingOverlay visible={isFetching} />
      <MantineReactTable table={table} />
    </div>
  );
};

export default CrosswalkTable;
