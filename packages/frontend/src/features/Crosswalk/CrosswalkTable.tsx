import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { CrosswalkMapping } from './types';
import React, { useMemo } from 'react';
import { Text } from '@mantine/core';
import { TableIcons } from '../../components/Tables/TableIcons';

interface CrosswalkTableProps {
  mapping: CrosswalkMapping;
  data: Array<any>;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  tableMessage: string;
  showSubmittedIdInTable: boolean;
}

const CrosswalkTable = ({
  mapping,
  data,
  isFetching,
  isError,
  tableMessage,
  showSubmittedIdInTable,
}: CrosswalkTableProps) => {
  const cols = useMemo(() => {
    return [
      ...(showSubmittedIdInTable
        ? [
            {
              accessorKey: 'from',
              header: mapping.source.label,
            },
          ]
        : []),

      ...mapping.external.map((columnDef, idx) => {
        return {
          accessorKey: `to.${mapping.external[idx].id}`,
          header: columnDef.label,
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
          backgroundColor: theme.colors.table[3],
          color: theme.colors.table[9],
          textAlign: 'center',
          padding: theme.spacing.md,
          fontWeight: 'bold',
          fontSize: theme.fontSizes.lg,
          textTransform: 'uppercase',
        };
      },
    },
    mantineTableContainerProps: ({ table }) => {
      return {
        sx: {
          maxHeight: 'calc(100vh - 560px) !important;',
        },
      };
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
      <MantineReactTable table={table} />
    </div>
  );
};

export default CrosswalkTable;
