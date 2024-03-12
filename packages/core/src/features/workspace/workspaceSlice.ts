import { gen3Api } from "../gen3";
import { GEN3_WORKSPACE_API } from "../../constants";

interface PayModel {
    bmh_workspace_id: string;
    workspace_type: string;
    user_id: string;
    account_id: string;
    request_status: string;
    local: boolean;
    region: string;
    ecs: boolean;
    subnet: number;
    "hard-limit": number;
    "soft-limit": number;
    "total-usage": number;
    "current_pay_model": boolean;
}

export interface WorkspaceOptionsResponse {
}

export interface WorkspacePayModelResponse {
    "current_pay_model": PayModel;
    "all_pay_models": PayModel[];
}

export interface WorkspaceStatusResponse {
    status: string;
    conditions: any | null; // todo change any
    containerStates: any | null; // here too
    idleTimeLimit: number;
    lastActivityTime: number;
    workspaceType: string;
}

export const workspaceApi = gen3Api.injectEndpoints({
    endpoints: (builder) => ({
        getWorkspaceOptions: builder.query<WorkspaceOptionsResponse, void>({
            query: () => ({
                url: `${GEN3_WORKSPACE_API}/options`,
                method: 'GET'
            }),
            transformResponse: (response: Record<string, any>, _meta) => {
                console.log('res', response);
                return response;
            },
        }),
        getWorkspacePayModel: builder.query<WorkspacePayModelResponse, void>({
            query: () => ({
                url: `${GEN3_WORKSPACE_API}/allpaymodels`,
                method: 'GET'
            }),
            transformResponse: (response: WorkspacePayModelResponse, _meta) => {
                console.log('res', response);
              return response;
            },
        }),
        getWorkspaceStatus: builder.query<WorkspaceStatusResponse, void>({
            query: () => ({
                url: `${GEN3_WORKSPACE_API}/status`,
                method: 'GET'
            }),
            transformResponse: (response: WorkspaceStatusResponse, _meta) => {
                console.log('res', response);
              return response;
            },
        }),

    })
});

export const { useGetWorkspaceOptionsQuery, useGetWorkspacePayModelQuery, useGetWorkspaceStatusQuery } = workspaceApi;
