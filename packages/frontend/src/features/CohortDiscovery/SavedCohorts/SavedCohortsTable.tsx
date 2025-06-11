import React, { useMemo } from 'react';
import { useAppDispatch } from '../appApi';
import {
  MantineReactTable,
  useMantineReactTable,
  MRT_ColumnDef,
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
import { Icon } from '@iconify/react';
import { notifications } from '@mantine/notifications';
import { IconSize } from '../../../utils/sizes';
import {
  selectAllCohorts,
  removeCohort,
  selectCohortById,
} from '../CohortManagerSlice';
import { useAppSelector } from '../appApi';
import {
  Cohort,
  DataAccessRequestUserInformation,
  IndexResourceField,
  SupportServiceConfiguration,
} from '../types';
import {
  addDataAccessRequest,
  selectCohortToRequestId,
} from '../RequestManagerSlice';
import DataAccessRequestForm from '../Requests/DataAccessRequestForm';
import { formatDate } from '../../../utils/date';
import { commonTableSettings } from '../tableSettings';
import { queryAllResources, QueryAllIndexedError } from '../Requests/hooks';
import {
  useLazyGetAggsNoFilterSelfQuery,
  useCreateRequestMutation,
  useCoreSelector,
  selectUserDetails,
  isHttpStatusError,
  getRemoteSupportServiceRegistry,
  type HttpError,
  MissingServiceConfigurationError,
} from '@gen3/core';

const REQUESTOR_HTTP_ERROR_MESSAGES: Record<number, string> = {
  401: 'You are not authorized to request access to this data. Please contact the site administrator.',
  403: 'You do not have the correct permissions to request this resource. Please contact the site administrator.',
};

interface CohortWithRequested extends Cohort {
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
  const [getGetAggs] = useLazyGetAggsNoFilterSelfQuery();
  const [requestQuery, requestResults] = useCreateRequestMutation();
  const user = useCoreSelector(selectUserDetails);

  console.log(user);

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
  const data: Cohort[] = useAppSelector(selectAllCohorts);
  const requestByCohortId = useAppSelector(selectCohortToRequestId);

  const tData = useDeepCompareMemo(
    () =>
      data.map((cohort) => ({
        ...cohort,
        requested: (requestByCohortId[cohort.id] ? 'true' : 'false') as string,
      })),
    [data, requestByCohortId],
  );

  const handleSubmission = async (
    cohortId: string,
    values: DataAccessRequestUserInformation,
  ) => {
    const cohort = data.find((obj) => obj.id === cohortId);
    if (cohort && values) {
      // need to get the resources requires by the cohort

      try {
        // query for resources from
        const resources = await queryAllResources(
          cohort.filters,
          indexResources,
          getGetAggs,
        );

        // now we have the resources, submit a requestor request
        const request = await requestQuery({
          resource_paths: resources,
        }).unwrap();

        // followed by a zendesk request

        const zendeskRequestAction =
          getRemoteSupportServiceRegistry().getSupportService(
            remoteSupportService.service,
          );

        await zendeskRequestAction(
          {
            subject: `Request for access to ${cohort.name}`,
            fullName: `${values.name}`,
            email: `${values.email}`,
            contents:
              `Requestor: ${values.name} (${values.email})` +
              `\n\nCohort: ${cohort.name}` +
              `\n\nResources: ${resources.join(', ')}` +
              `\n\nRequestor ID: ${user?.username || 'unknown'}` +
              `\n\nRequest ID: ${request.request_id}` +
              `\n\nRequest URL: ${window.location.href}` +
              `\n\nRequestor Email: ${values.email}` +
              `\n\nRequestor Name: ${values.name}` +
              `\n\nRequestor Organization: ${values.organization}`,
          },
          remoteSupportService.configuration,
        );

        // update the request store
        appDispatch(
          addDataAccessRequest({
            cohortId,
            id: request.request_id ?? 'unknown',
            name: values.name,
            email: values.email,
            status: request.status ?? 'unknown',
            organization: values.organization,
            createdDatetime: request.created_time ?? 'unknown',
            updatedDatetime: request.updated_time ?? 'unknown',
          }),
        );
        // Close the modal after a successful dispatch
        close();
      } catch (error: unknown) {
        if (error instanceof QueryAllIndexedError) {
          notifications.show({
            title: 'Request Cohort',
            message: `Error while getting resources for cohort: ${error.message}`,
          });
        } else if (isHttpStatusError(error)) {
          const httpError = error as HttpError;
          notifications.show({
            title: 'Request Cohort',
            message:
              REQUESTOR_HTTP_ERROR_MESSAGES[httpError.status] ||
              `Error while submitting resource request for cohorts`,
          });
        } else if (error instanceof MissingServiceConfigurationError) {
          notifications.show({
            title: 'Request Cohort',
            message: `Error while submitting resource request for cohorts: ${error.message}`,
          });
        } else if (error instanceof Error) {
          notifications.show({
            title: 'Request Cohort',
            message: `Error while submitting resource request for cohorts: ${error.message}`,
          });
        } else {
          notifications.show({
            title: 'Request Cohort',
            message:
              'Unknown error while submitting resource request for cohorts',
          });
        }
      }
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
