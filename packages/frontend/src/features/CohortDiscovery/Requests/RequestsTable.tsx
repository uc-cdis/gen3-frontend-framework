import React, { useMemo } from 'react';
import { AppState } from '../appApi';

import {
  MantineReactTable,
  useMantineReactTable,
  MRT_ColumnDef,
} from 'mantine-react-table';
import { TableIcons } from '../../../components/Tables/TableIcons';
import { selectCohortIdToNameMap } from '../CohortManagerSlice';
import { selectAllDataAccessRequests } from '../RequestManagerSlice';
import { useAppSelector } from '../appApi';
import { DataAccessRequest } from '../types';
import { useDeepCompareMemo } from 'use-deep-compare';
import { Text } from '@mantine/core';
import { formatDate } from '../../../utils/date';

interface RequestWithCohort extends DataAccessRequest {
  cohortName: string;
}
const RequestsTable = () => {
  const requests: Array<DataAccessRequest> = useAppSelector(
    selectAllDataAccessRequests,
  );
  const columns = useMemo<MRT_ColumnDef<RequestWithCohort, string>[]>(
    () => [
      {
        accessorKey: 'cohortName',
        header: 'Cohort',
        Cell: ({ cell }) => <Text>{cell.getValue()} </Text>,
      },
      {
        accessorKey: 'request_datetime',
        header: 'Request Date',
        Cell: ({ cell }) => <Text>{formatDate(cell.getValue())} </Text>,
      },
      {
        accessorKey: 'status', //normal accessorKey
        header: 'Status',
        Cell: ({ cell }) => <Text>{cell.getValue()} </Text>,
        cellProps: {
          style: {
            textTransform: 'uppercase',
          },
        },
      },
    ],
    [],
  );

  const cohortIdToNameMap = useAppSelector(selectCohortIdToNameMap);

  const requestsWithCohorts = useDeepCompareMemo(
    () =>
      requests.map((request) => {
        return {
          ...request,
          cohortName: cohortIdToNameMap[request.cohortId] || 'Unknown',
        };
      }),
    [requests, cohortIdToNameMap],
  );

  const table = useMantineReactTable<RequestWithCohort>({
    columns,
    data: requestsWithCohorts,
    icons: TableIcons,
    enableTopToolbar: false,
    enableStickyHeader: true,
    mantinePaginationProps: {
      rowsPerPageOptions: ['5', '10', '20', '40', '100'],
      withEdges: false, //note: changed from `showFirstLastButtons` in v1.0
    },
    mantineTableHeadCellProps: {
      style: {
        '--mrt-base-background-color': 'var(--mantine-color-table-1)',
        color: `var(--mantine-color-table-contrast-5')`,
      },
    },
    mantineTableHeadRowProps: {
      style: {
        '--mrt-base-background-color': 'var(--mantine-color-secondary-2)',
        borderColor: 'var(--mantine-color-secondary-2)',
        borderWidth: '1px',
        boxShadow: 'none',
        align: 'center',
        fontSize: 'var(--mantine-font-size-sm)',
        fontWeight: 600,
        color: 'var(--mantine-color-secondary-contrast-2)',
      },
    },
  });

  return (
    <div className="inline-block overflow-x-scroll w-full">
      <MantineReactTable table={table} />
    </div>
  );
};
export default RequestsTable;
