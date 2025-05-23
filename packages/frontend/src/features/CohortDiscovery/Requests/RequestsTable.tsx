import React, { useMemo } from 'react';

import {
  MantineReactTable,
  useMantineReactTable,
  MRT_ColumnDef,
  MRT_Cell,
} from 'mantine-react-table';
import { useUserRequestQuery } from '@gen3/core';
import { selectCohortIdToNameMap } from '../CohortManagerSlice';
import { selectAllDataAccessRequests } from '../RequestManagerSlice';
import { useAppSelector } from '../appApi';
import { DataAccessRequest } from '../types';
import { useDeepCompareMemo } from 'use-deep-compare';
import { Text } from '@mantine/core';
import { formatDate } from '../../../utils/date';
import { commonTableSettings } from '../tableSettings';
import { ErrorCard } from '../../../components/MessageCards';

interface ColumnCellParams {
  cell: MRT_Cell<RequestWithCohort, string>;
}

interface RequestWithCohort extends DataAccessRequest {
  cohortName: string;
}
const RequestsTable = () => {
  const {
    data: requests,
    isFetching,
    isError,
    error,
    isSuccess,
  } = useUserRequestQuery();

  const columns = useMemo<MRT_ColumnDef<RequestWithCohort, string>[]>(
    () => [
      {
        accessorKey: 'cohortName',
        header: 'Cohort',
        Cell: ({ cell }: ColumnCellParams) => (
          <Text>{cell.getValue<string>()} </Text>
        ),
      },
      {
        accessorKey: 'request_datetime',
        header: 'Request Date',
        Cell: ({ cell }: ColumnCellParams) => (
          <Text>{formatDate(cell.getValue<string>())} </Text>
        ),
      },
      {
        accessorKey: 'status', //normal accessorKey
        header: 'Status',
        Cell: ({ cell }: ColumnCellParams) => (
          <Text>{cell.getValue<string>()} </Text>
        ),
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
          cohortName: (cohortIdToNameMap[request.cohortId] ||
            'Unknown') as string,
        };
      }),
    [requests, cohortIdToNameMap],
  );

  const size = 'sm';
  const table = useMantineReactTable<RequestWithCohort>({
    columns,
    data: requestsWithCohorts,
    ...commonTableSettings<RequestWithCohort>(),
    state: {
      isLoading: isFetching,
    },
  });

  if (isError) {
    return (
      <div className="w-full h-dvh flex flex-col items-center justify-center">
        <ErrorCard message={`Error retrieving user request`} />
      </div>
    );
  }

  return (
    <div className="inline-block overflow-x-scroll w-full">
      <MantineReactTable table={table} />
    </div>
  );
};
export default RequestsTable;
