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
import { commonTableSettings } from '../tableSettings';

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
    ...commonTableSettings(),
  });

  return (
    <div className="inline-block overflow-x-scroll w-full">
      <MantineReactTable table={table} />
    </div>
  );
};
export default RequestsTable;
