import React, { useMemo } from 'react';
import { AppState } from '../appApi';

import {
  MantineReactTable,
  useMantineReactTable,
  MRT_ColumnDef,
} from 'mantine-react-table';
import { TableIcons } from '../../../components/Tables/TableIcons';

import { selectAllCohorts } from '../CohortManagerSlice';
import { useAppSelector } from '../appApi';
import { Cohort, DataAccessRequest } from '../types';

interface RequestWithCohort extends DataAccessRequest {
  cohortName: string;
}
const RequestsTable = () => {
  const columns = useMemo<MRT_ColumnDef<RequestWithCohort>[]>(
    () => [
      {
        accessorKey: 'request_datetime',
        header: 'Request Date',
      },
      {
        accessorKey: 'cohortName',
        header: 'Cohort',
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
    [],
  );

  const cohorts: Cohort[] = useAppSelector((state: AppState) =>
    selectAllCohorts(state),
  );

  const requests: RequestWithCohort[] = cohorts
    .map((cohort) =>
      cohort.dataAccessRequest
        ? { ...cohort?.dataAccessRequest, cohortName: cohort.name }
        : null,
    )
    .filter((request) => request !== null) as RequestWithCohort[];

  const table = useMantineReactTable<RequestWithCohort>({
    columns,
    data: requests,
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
