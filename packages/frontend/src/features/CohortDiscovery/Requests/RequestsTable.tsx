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

interface RequestWithCohort extends DataAccessRequest {
  cohortName: string;
}
const RequestsTable = () => {
  const requests: Array<DataAccessRequest> = useAppSelector(
    selectAllDataAccessRequests,
  );
  const columns = useMemo<MRT_ColumnDef<RequestWithCohort>[]>(
    () => [
      {
        accessorKey: 'cohortName',
        header: 'Cohort',
      },
      {
        accessorKey: 'request_datetime',
        header: 'Request Date',
      },
      {
        accessorKey: 'status', //normal accessorKey
        header: 'Status',
        cellProps: {
          style: {
            textTransform: 'capitalize',
          },
        },
      },
    ],
    [requests],
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
  });

  return (
    <div className="inline-block overflow-x-scroll w-full">
      <MantineReactTable table={table} />
    </div>
  );
};
export default RequestsTable;
