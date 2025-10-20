import React, { useEffect, useMemo, useState } from 'react';
import {
  MantineReactTable,
  useMantineReactTable,
  MRT_ColumnDef,
  MRT_Cell,
} from 'mantine-react-table';
import { useUserRequestQuery } from '@gen3/core';
import { selectCohortIdToNameMap } from '../CohortManagment/CohortManagerSelectors';
import { selectAllDataAccessRequests } from '../RequestManagerSlice';
import { useAppSelector } from '../appApi';
import { DataAccessRequest, DataAccessRequestStatus } from '../types';

import { Text } from '@mantine/core';
import { formatDate } from '../../../utils/date';
import { commonTableSettings } from '../tableSettings';
import { ErrorCard } from '../../../components/MessageCards';
import { EmptyTableMessage } from '../../../components/MessageCards';

const useGetCohortRequests = (resources: string[] = []) => {
  const [isLoading, setIsLoading] = useState(false);
  const [cohortRequests, setCohortRequests] = useState<
    Array<RequestWithCohort>
  >([]);
  const localRequests: Array<DataAccessRequest> = useAppSelector(
    selectAllDataAccessRequests,
  );
  const {
    data: submittedRequests,
    isFetching,
    isError,
    error,
  } = useUserRequestQuery({ resource_ids: resources });

  const cohortIdToNameMap = useAppSelector(selectCohortIdToNameMap);

  useEffect(() => {
    // Return early if we're still fetching data
    if (isFetching) {
      setIsLoading(true);
      return;
    }

    // Once data is available, merge local and remote requests
    if (submittedRequests) {
      // Create a map of local requests by ID
      const localRequestsMap = localRequests.reduce(
        (acc, localRequest) => {
          acc[localRequest.id] = localRequest;
          return acc;
        },
        {} as Record<string, DataAccessRequest>,
      );

      // Add cohort names to the requests
      const requestsWithCohorts = submittedRequests.reduce(
        (acc: Array<RequestWithCohort>, request) => {
          if (
            request.request_id &&
            Object.hasOwn(localRequestsMap, request.request_id)
          ) {
            const localRequest = localRequestsMap[request.request_id as string];
            acc.push({
              ...localRequest,
              cohortName:
                cohortIdToNameMap[localRequest.cohortId] ?? 'Not Found',
              status: (request?.status ?? 'unknown') as DataAccessRequestStatus,
              updatedDatetime:
                request.created_time ?? localRequest.updatedDatetime,
              createdDatetime:
                request.updated_time ?? localRequest.createdDatetime,
            });
          } else {
            acc.push({
              ...request,
              cohortId: 'Not Set',
              email: request.username ?? 'Not Set',
              name: 'Not Set',
              organization: 'Not Set',
              id: request.request_id ?? 'Not Set',
              cohortName: 'Not Found',
              status: (request?.status ?? 'unknown') as DataAccessRequestStatus,
              updatedDatetime: request.created_time ?? 'Not Set',
              createdDatetime: request.updated_time ?? ' Not Set',
            });
          }
          return acc;
        },
        [] as Array<RequestWithCohort>,
      );

      setCohortRequests(requestsWithCohorts);
    } else if (isError) {
      // If there's an error fetching remote data, use local requests
      const localRequestsWithCohorts = localRequests.map((request) => ({
        ...request,
        cohortName: request.id ? cohortIdToNameMap[request.id] : 'Unknown',
      }));

      setCohortRequests(localRequestsWithCohorts);
    }

    setIsLoading(false);
  }, [
    submittedRequests,
    localRequests,
    isFetching,
    isError,
    cohortIdToNameMap,
  ]);

  return {
    cohortRequests,
    isLoading: isLoading || isFetching,
    isError,
    error,
  };
};

interface ColumnCellParams {
  cell: MRT_Cell<RequestWithCohort, string>;
}

interface RequestWithCohort extends DataAccessRequest {
  cohortName?: string;
}
const RequestsTable = () => {
  const { cohortRequests, isLoading, isError } =
    useGetCohortRequests(undefined);

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
        accessorKey: 'createdDatetime',
        header: 'Request Date',
        Cell: ({ cell }: ColumnCellParams) => (
          <Text>{formatDate(cell.getValue<string>())} </Text>
        ),
      },
      {
        accessorKey: 'updatedDatetime',
        header: 'Last Update',
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

  const size = 'sm';
  const table = useMantineReactTable<RequestWithCohort>({
    columns,
    data: cohortRequests ?? [],
    renderEmptyRowsFallback: () => (
      <EmptyTableMessage message={'No requests submitted.'} />
    ),
    ...commonTableSettings<RequestWithCohort>(size),
    state: {
      isLoading: isLoading,
    },
  });

  if (isError) {
    return (
      <div className="w-full mt-24 flex flex-col items-center justify-center">
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
