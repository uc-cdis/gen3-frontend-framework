import React, { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../appApi';
import {
  MantineReactTable,
  MRT_ColumnDef,
  useMantineReactTable,
} from 'mantine-react-table';
import { useDeepCompareMemo } from 'use-deep-compare';
import {
  ActionIcon,
  Group,
  Text,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { Icon } from '@iconify-icon/react';
import { IconSize } from '../../../utils/sizes';
import { removeCohort } from '../CohortManagment/CohortManagerSlice';
import { selectAllCohorts } from '../CohortManagment/CohortManagerSelectors';
import {
  DataAccessRequestUserInformation,
  DiscoveryCohort,
  IndexResourceField,
  SupportServiceConfiguration,
} from '../types';
import { selectCohortToRequestId } from '../RequestManagerSlice';
import DataAccessRequestForm from '../Requests/DataAccessRequestForm';
import { formatDate } from '../../../utils/date';
import { commonTableSettings } from '../tableSettings';
import {
  isIndexedFilterSetEmpty,
  selectUserDetails,
  useCoreSelector,
  useCreateRequestMutation,
  useLazyGetAggsQuery,
} from '@gen3/core';
import { submitCohortRequestAction } from '../Requests/submitCohortRequestAction';

interface CohortWithRequested extends DiscoveryCohort {
  requested: string;
}

interface SavedCohortsTableProps {
  indexResources: IndexResourceField;
  remoteSupportService: SupportServiceConfiguration;
  size?: string;
}

const SavedCohortsTable: React.FC<SavedCohortsTableProps> = ({
  indexResources,
  remoteSupportService,
  size = 'md',
}) => {
  const appDispatch = useAppDispatch();
  const [getGetAggs] = useLazyGetAggsQuery();
  const [requestQuery] = useCreateRequestMutation();
  const user = useCoreSelector(selectUserDetails);

  const columns = useMemo<MRT_ColumnDef<CohortWithRequested, string>[]>(
    () => [
      {
        accessorKey: 'name', //access nested data with dot notation
        header: 'Name',
        Cell: ({ cell }) => <Text>{cell.getValue()} </Text>,
      },
      {
        accessorKey: 'createdDatetime',
        header: 'Modified Date',
        Cell: ({ cell }) => <Text>{formatDate(cell.getValue())} </Text>,
      },
      {
        accessorKey: 'modifiedDatetime', //normal accessorKey
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
  const data: DiscoveryCohort[] = useAppSelector(selectAllCohorts);
  const requestByCohortId = useAppSelector(selectCohortToRequestId);

  const tData = useDeepCompareMemo(
    () =>
      data.map((cohort) => ({
        ...cohort,
        requested: (requestByCohortId[cohort.id] ? 'true' : 'false') as string,
      })),
    [data, requestByCohortId],
  );

  const handleCohortAccessRequest = async (
    cohortId: string,
    values: DataAccessRequestUserInformation,
  ) => {
    const cohort = data.find((obj) => obj.id === cohortId);

    if (cohort)
      await submitCohortRequestAction(
        cohort,
        values,
        user,
        indexResources,
        remoteSupportService,
        appDispatch,
        getGetAggs,
        requestQuery,
      );
  };

  const table = useMantineReactTable<CohortWithRequested>({
    columns,
    data: tData,
    getRowId: (originalRow) => originalRow.id,
    ...commonTableSettings(),
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => {
      const hasNoFilters = isIndexedFilterSetEmpty(row.original.filters);
      return (
        <Group wrap="nowrap" gap="xs">
          <Tooltip
            label={
              hasNoFilters
                ? 'No Filters defined. Cannot submit request.'
                : 'Submit Data Access Request'
            }
            withArrow
          >
            <ActionIcon
              color="accent.4"
              variant="transparent"
              disabled={hasNoFilters}
              aria-label="Submit Data Access Request"
              onClick={() => {
                const modelId = modals.open({
                  title: 'DATA ACCESS REQUEST',
                  children: (
                    <DataAccessRequestForm
                      cohortId={row.id}
                      submitFunction={handleCohortAccessRequest}
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
                      Are you sure you want to delete your cohort? Deleted
                      cohorts cannot be restored.{' '}
                      {row.original?.requested
                        ? `This cohort has an access request. Deleting this cohort will results in not being able to correlate nay pending requests.
                    Are you sure you want to delete this cohort?.`
                        : ''}
                    </Text>
                  ),
                  labels: { confirm: 'Delete Cohort', cancel: 'Cancel' },
                  confirmProps: { color: theme.colors.accent[4] },
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
      );
    },
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
