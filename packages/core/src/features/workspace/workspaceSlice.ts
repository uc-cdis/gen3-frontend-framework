import { gen3Api } from '../gen3';
import { GEN3_WORKSPACE_API } from '../../constants';
import {
    WorkspaceInfo,
    WorkspaceInfoResponse,
    WorkspaceOptions,
    WorkspaceOptionsResponse,
    WorkspacePayModelResponse,
    WorkspaceStatusResponse,
} from './types';

export const workspacesApi = gen3Api.injectEndpoints({
    endpoints: (builder) => ({
        getWorkspaceOptions: builder.query<WorkspaceOptions, void>({
            query: () => `${GEN3_WORKSPACE_API}/options`,
            transformResponse: (response: WorkspaceOptionsResponse)  => {
                return response.map((workspace : WorkspaceInfoResponse)  => {
                        return {
                            id: workspace.id,
                            name: workspace.name,
                            idleTimeLimit: workspace['idle-time-limit'],
                            memoryLimit: workspace['memory-limit'],
                            cpuLimit: workspace['cpu-limit'],
                        } as WorkspaceInfo;
                    });
            }
        }),
        getWorkspacePayModels: builder.query<WorkspacePayModelResponse, void>({
            query: () => `${GEN3_WORKSPACE_API}/allpaymodels`,
        }),
        getWorkspaceStatus: builder.query<WorkspaceStatusResponse, void>({
            query: () => `${GEN3_WORKSPACE_API}/status`,
        }),
    } as const),
});

export const {
    useGetWorkspaceOptionsQuery,
    useGetWorkspacePayModelsQuery,
    useGetWorkspaceStatusQuery,

} = workspacesApi;
