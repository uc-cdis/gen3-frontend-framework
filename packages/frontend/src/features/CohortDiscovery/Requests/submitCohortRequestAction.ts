import { notifications } from '@mantine/notifications';
import {
  getRemoteSupportServiceRegistry,
  type HttpError,
  isHttpStatusError,
  MissingServiceConfigurationError,
  useCreateRequestMutation,
  type UserProfile,
} from '@gen3/core';

import { addDataAccessRequest } from '../RequestManagerSlice';
import {
  DataAccessRequestUserInformation,
  DiscoveryCohort,
  IndexResourceField,
  SupportServiceConfiguration,
} from '../types';
import {
  QueryAllIndexedError,
  queryAllResources,
  QueryGQLAggsrFunctionType,
} from './hooks';
import { useAppDispatch } from '../appApi';

// To get the return type of the whole hook
type RequestMutationHookResult = ReturnType<typeof useCreateRequestMutation>;
// To get just the type of the trigger function (first element of tuple)
export type RequestMutationTriggerFunctionType = RequestMutationHookResult[0];

const REQUESTOR_HTTP_ERROR_MESSAGES: Record<number, string> = {
  401: 'You are not authorized to request access to this data. Please contact the site administrator.',
  403: 'You do not have the correct permissions to request this resource. Please contact the site administrator.',
};

export const submitCohortRequestAction = async (
  cohort: DiscoveryCohort,
  values: DataAccessRequestUserInformation,
  user: Partial<UserProfile>,
  indexResources: IndexResourceField,
  remoteSupportService: SupportServiceConfiguration,
  appDispatch: ReturnType<typeof useAppDispatch>,
  getAggs: QueryGQLAggsrFunctionType,
  createRequestQuery: RequestMutationTriggerFunctionType,
) => {
  if (cohort && values) {
    // need to get the resources requires by the cohort

    try {
      // query for resources from
      const resources = await queryAllResources(
        cohort.filters,
        indexResources,
        getAggs,
      );

      // now we have the resources, submit a requestor request
      const request = await createRequestQuery({
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
          cohortId: cohort.id,
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
