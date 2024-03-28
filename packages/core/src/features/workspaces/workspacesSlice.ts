import { gen3Api } from '../gen3';
import { GEN3_WORKSPACE_STATUS_API } from '../../constants';



export const workspacesApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspaceOptions: builder.query<any, void>({
      query: () => `${GEN3_WORKSPACE_STATUS_API}/options`,
    }),
    getWorkspacePayModels: builder.query<any, void>({
      query: () => `${GEN3_WORKSPACE_STATUS_API}/allpaymodels`,
    }),
    getWorkspaceStatus: builder.query<any, void>({
      query: () => `${GEN3_WORKSPACE_STATUS_API}/status`,
    }),
    } as const),
  });

export const {
  useGetWorkspaceOptionsQuery,
  useGetWorkspacePayModelsQuery,
  useGetWorkspaceStatusQuery,

} = workspacesApi;
