import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { CrosswalkMapping } from './types';
import React, { useMemo } from 'react';
import { LoadingOverlay, Text } from '@mantine/core';
import { TableIcons } from '../../components/Tables/TableIcons';

interface CrosswalkTableProps {
  mapping: CrosswalkMapping;
  data: Array<any>;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  tableMessage: string;
}

const CrosswalkTable = ({
  mapping,
  data,
  isFetching,
  isError,
  tableMessage,
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
    icons: TableIcons,
    enableStickyHeader: true,
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
          color: theme.colors.table[9],
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
    renderEmptyRowsFallback: () => {
      return (
        <div className="flex justify-center items-center content-center h-96 w-full">
          <Text>{tableMessage}</Text>
        </div>
      );
    },
  });

  return (
    <div className="grow w-auto inline-block overflow-x-auto">
      <LoadingOverlay visible={isFetching} />
      <MantineReactTable table={table} />
    </div>
  );
};

export default CrosswalkTable;
