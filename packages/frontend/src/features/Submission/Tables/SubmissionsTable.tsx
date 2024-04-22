import React, { useMemo } from 'react';
import {
  MantineReactTable,
  useMantineReactTable,
} from 'mantine-react-table';
import { useGetSubmissionGraphQLQuery } from '@gen3/core';
import { Loader, Text } from '@mantine/core';


const query = `query transactionList {
    transactionList: transaction_log(last: 20) {
      id
      submitter
      project_id
      created_datetime
      documents {
        doc_size
        doc
        id
      }
      state
    }
}`;

const cols =
[
    {
      field: 'submitter',
      accessorKey: 'submitter',
      header: 'Submitter',
    },
    {
      field: 'project_id',
      accessorKey: 'project_id',
      header: 'Project',
    },
    {
      field: 'created_datetime',
      accessorKey: 'created_datetime',
      header: 'Created Date',
    },
    {
      field: 'state',
      accessorKey: 'state',
      header: 'State',
    },
  ];

const SubmissionsTable = () => {

  const { data, isLoading, isError } = useGetSubmissionGraphQLQuery(
    {
      query,
    }
  );

  const rows = useMemo(() => {
    if (data) {
      return data.transactionList;
    }
    return [];

  }, [data]);


  const table = useMantineReactTable({
    columns: cols,
    data: rows,
    manualSorting: true,
    manualPagination: true,
    paginateExpandedRows: false,
    rowCount: data?.hits ?? 0,
    enableTopToolbar: false,
    layoutMode: 'semantic',
    state: {
      isLoading,
      pagination,
      showProgressBars: isFetching,
      showAlertBanner: isError,
      columnVisibility: {
        'mrt-row-expand': false,
      },
    },
    mantineTableHeadCellProps: {
      sx: (theme) => {
        return {
          backgroundColor: theme.colors.table[8],
          color: theme.colors.table[0],
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
          backgroundColor: theme.colors.base[9],
        };
      },
    }
  });

  if (isLoading) {
    return (
      <div className="flex w-full py-24 relative justify-center"><Loader  variant="dots"  /> </div>);
  }

  if (isError) {
    return (
      <div className="flex w-full py-24 h-100 relative justify-center">
        <Text size={'xl'}>Error loading project data</Text>
      </div>);
  }

  return (
    <div className="grow w-auto inline-block overflow-x-scroll">
      <MantineReactTable table={table} />
    </div>
  );

}

export default SubmissionsTable;
