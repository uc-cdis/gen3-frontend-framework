import { gen3Api } from '../gen3';
import { GEN3_WORKSPACE_API } from '../../constants';
import {
  PayModel,
  PodStatus,
  WorkspaceInfo,
  WorkspaceInfoResponse,
  WorkspaceOptions,
  WorkspaceOptionsResponse,
  WorkspacePayModelResponse,
  WorkspaceStatus,
  WorkspaceStatusResponse,
} from './types';
import { selectActiveWorkspaceStatus } from './workspaceSlice';
import { CoreState } from '../../reducers';
import { isFetchParseError, isHttpStatusError } from '../../types';
import { createSelector } from '@reduxjs/toolkit';

interface WorkspacePayModelRawResponse {
  current_pay_model: PayModel;
  all_pay_models: Array<PayModel>;
}

const WorkspaceWithTags = gen3Api.enhanceEndpoints({
  addTagTypes: ['Workspace', 'PayModel'],
});

export const EmptyWorkspaceStatusResponse: WorkspaceStatusResponse = {
  status: WorkspaceStatus.NotFound,
  conditions: [],
  containerStates: [],
  idleTimeLimit: 0,
  lastActivityTime: 0,
  workspaceType: '',
};

export const workspacesApi = WorkspaceWithTags.injectEndpoints({
  endpoints: (builder) =>
    ({
      getWorkspaceOptions: builder.query<WorkspaceOptions, void>({
        query: () => `${GEN3_WORKSPACE_API}/options`,
        transformResponse: (response: WorkspaceOptionsResponse) => {
          return response.map((workspace: WorkspaceInfoResponse) => {
            return {
              id: workspace.id,
              name: workspace.name,
              idleTimeLimit: workspace['idle-time-limit'],
              memoryLimit: workspace['memory-limit'],
              cpuLimit: workspace['cpu-limit'],
            } as WorkspaceInfo;
          });
        },
      }),
      getWorkspacePayModels: builder.query<WorkspacePayModelResponse, void>({
        query: () => `${GEN3_WORKSPACE_API}/allpaymodels`,
        providesTags: ['PayModel'],
        transformResponse: (response: WorkspacePayModelRawResponse) => {
          return {
            currentPayModel: response.current_pay_model,
            allPayModels: response.all_pay_models,
            noPayModel: false,
          };
        },
      }),
      getActivePayModel: builder.query<PayModel, void>({
        query: () => `${GEN3_WORKSPACE_API}/paymodels`,
        providesTags: ['PayModel'],
      }),
      setCurrentPayModel: builder.mutation<void, string>({
        query: (id: string) => ({
          url: `${GEN3_WORKSPACE_API}/setpaymodel`,
          method: 'POST',
          body: id,
          invalidatesTags: ['PayModel'],
        }),
      }),
      getWorkspaceStatus: builder.query<WorkspaceStatusResponse, void>({
        queryFn: async (_arg0, queryApi, _extraOptions, fetchWithBQ) => {
          const currentWorkspaceStatus = selectActiveWorkspaceStatus(
            queryApi.getState() as CoreState,
          );

          const workspaceStatus = await fetchWithBQ(
            `${GEN3_WORKSPACE_API}/status`,
          );
          if (workspaceStatus.error) {
            return workspaceStatus;
          }

          // TODO: try to find out IF this is code is required
          const workspaceStatusData =
            workspaceStatus.data as unknown as WorkspaceStatusResponse;

          if (
            workspaceStatusData.status === WorkspaceStatus.Running &&
            (currentWorkspaceStatus === 'Not Found' ||
              currentWorkspaceStatus === 'Launching')
          ) {
            const proxyStatus = await fetchWithBQ(
              `${GEN3_WORKSPACE_API}/proxy/`,
            );
            let statusError = undefined;
            if (isFetchParseError(proxyStatus.error)) {
              statusError = proxyStatus.error.originalStatus;
            }

            if (isHttpStatusError(proxyStatus.error)) {
              statusError = proxyStatus.error.status;
            }

            if (statusError && statusError !== 200) {
              return {
                data: {
                  ...workspaceStatusData,
                  status: WorkspaceStatus.Launching,
                  conditions: [
                    {
                      type: 'ProxyConnected',
                      status: PodStatus.False,
                    },
                  ],
                } as WorkspaceStatusResponse,
              };
            }
          }
          return { data: workspaceStatus.data as WorkspaceStatusResponse };
        },
        providesTags: ['Workspace'],
      }),
      launchWorkspace: builder.mutation<boolean, string>({
        query: (id) => {
          return {
            url: `${GEN3_WORKSPACE_API}/launch?id=${id}`,
            method: 'POST',
            invalidatesTags: ['Workspace'],
            responseHandler: (response) => response.text(),
          };
        },
        transformResponse: async (response: string) => {
          return !!(response && response === 'Success');
        },
      }),
      terminateWorkspace: builder.mutation<void, void>({
        query: () => ({
          url: `${GEN3_WORKSPACE_API}/terminate`,
          method: 'POST',
          invalidatesTags: ['Workspace'],
          responseHandler: (response) => response.text(),
        }),
      }),
    }) as const,
});

export const {
  useGetWorkspaceOptionsQuery,
  useGetWorkspacePayModelsQuery,
  useGetWorkspaceStatusQuery,
  useGetActivePayModelQuery,
  useSetCurrentPayModelMutation,
  useLaunchWorkspaceMutation,
  useTerminateWorkspaceMutation,
} = workspacesApi;

export const workspaceStatusSelector =
  workspacesApi.endpoints.getWorkspaceStatus.select();

export const selectWorkspaceStatusFromService = createSelector(
  workspaceStatusSelector,
  (status) =>
    status.data ?? {
      ...EmptyWorkspaceStatusResponse,
    },
);

export const selectWorkspaceStatus = createSelector(
  workspaceStatusSelector,
  (status) => status?.data?.status ?? WorkspaceStatus.NotFound,
);
