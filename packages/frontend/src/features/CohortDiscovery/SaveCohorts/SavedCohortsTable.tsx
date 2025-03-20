import React, { useMemo } from 'react';
import { useAppDispatch } from '../appApi';
import {
  MantineReactTable,
  useMantineReactTable,
  MRT_ColumnDef,
} from 'mantine-react-table';
import { useDeepCompareMemo } from 'use-deep-compare';
import { TableIcons } from '../../../components/Tables/TableIcons';
import {
  ActionIcon,
  Center,
  Group,
  Text,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { Icon } from '@iconify/react';
import { IconSize } from '../../../utils/sizes';
import { selectAllCohorts, removeCohort } from '../CohortManagerSlice';
import { useAppSelector } from '../appApi';
import { Cohort, DataAccessRequestUserInformation } from '../types';
import {
  addDataAccessRequest,
  selectCohortToRequestId,
} from '../RequestManagerSlice';
import DataAccessRequestForm from '../Requests/DataAccessRequestForm';
import { formatDate } from '../../../utils/date';
import { commonTableSettings } from '../tableSettings';

interface CohortWithRequested extends Cohort {
  requested: string;
}

interface SavedCohortsTableProps {
  size?: string;
}
const SavedCohortsTable: React.FC<SavedCohortsTableProps> = ({
  size = 'md',
}) => {
  const appDispatch = useAppDispatch();

  const columns = useMemo<MRT_ColumnDef<CohortWithRequested, string>[]>(
    () => [
      {
        accessorKey: 'name', //access nested data with dot notation
        header: 'Name',
        Cell: ({ cell }) => <Text>{cell.getValue()} </Text>,
      },
      {
        accessorKey: 'created_datetime',
        header: 'Modified Date',
        Cell: ({ cell }) => <Text>{formatDate(cell.getValue())} </Text>,
      },
      {
        accessorKey: 'modified_datetime', //normal accessorKey
        header: 'Created Date',
        Cell: ({ cell }) => <Text>{formatDate(cell.getValue())} </Text>,
      },
      {
        accessorKey: 'requested', //normal accessorKey
        header: 'Requested',
        Cell: ({ cell }) =>
          cell.getValue() === 'true' && (
            <Icon icon="gen3:check" height="2em" width="2em" color="green" />
          ),
      },
    ],
    [],
  );

  const iconSize = IconSize[size] || IconSize['sm'];
  const theme = useMantineTheme();
  const data: Cohort[] = useAppSelector(selectAllCohorts);
  const requestByCohortId = useAppSelector(selectCohortToRequestId);

  const tData = useDeepCompareMemo(
    () =>
      data.map((cohort) => ({
        ...cohort,
        requested: requestByCohortId[cohort.id] ? 'true' : 'false',
      })),
    [data, requestByCohortId],
  );

  const handleSubmission = (
    cohortId: string,
    values: DataAccessRequestUserInformation,
  ) => {
    if (cohortId && values) {
      appDispatch(
        addDataAccessRequest({ cohortId, userAccessInformation: values }),
      );
      // Close the modal after successful dispatch
      close();
    }
  };

  const table = useMantineReactTable<CohortWithRequested>({
    columns,
    data: tData,
    getRowId: (originalRow) => originalRow.id,
    ...commonTableSettings(),
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => (
      <Group wrap="nowrap" gap="xs">
        <Tooltip label="Submit Data Access Request" withArrow>
          <ActionIcon
            color="accent.4"
            variant="transparent"
            aria-label="Submit Data Access Request"
            onClick={() => {
              const modelId = modals.open({
                title: 'DATA ACCESS REQUEST',
                children: (
                  <DataAccessRequestForm
                    cohortId={row.id}
                    submitFunction={handleSubmission}
                    close={() => modals.close(modelId)}
                  />
                ),
              });
            }}
          >
            <Icon
              icon="gen3:request"
              height={iconSize}
              width={iconSize}
              color={theme.colors.secondary[4]}
            />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Select Cohort" withArrow>
          <ActionIcon
            color="accent.4"
            variant="transparent"
            aria-label="Select cohort"
            onClick={() => {}}
          >
            <Icon
              icon="gen3:cohort"
              height={iconSize}
              width={iconSize}
              color={theme.colors.secondary[4]}
            />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete Cohort" withArrow>
          <ActionIcon
            color="accent.4"
            variant="transparent"
            aria-label="Delete saved cohort"
            onClick={() => {
              modals.openConfirmModal({
                title: 'Delete Cohort',
                centered: true,
                children: (
                  <Text size="sm">
                    Are you sure you want to delete your cohort? Deleted cohorts
                    cannot be restored.
                  </Text>
                ),
                labels: { confirm: 'Delete Cohort', cancel: 'Cancel' },
                confirmProps: { color: theme.colors.utility[2] },
                onConfirm: () => {
                  appDispatch(removeCohort(row.id));
                },
              });
            }}
          >
            <Icon
              icon="gen3:delete"
              height={iconSize}
              width={iconSize}
              color={theme.colors.secondary[4]}
            />
          </ActionIcon>
        </Tooltip>
      </Group>
    ),
  });

  return (
    <>
      <div className="inline-block overflow-x-scroll w-full">
        <MantineReactTable table={table} />
      </div>
    </>
  );
};
export default SavedCohortsTable;
