import { gen3Api } from '../gen3';
import { GEN3_WORKSPACE_STATUS_API } from '../../constants';



export const workspacesApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspaceOptions: builder.query<any, void>({
      query: () => `${GEN3_WORKSPACE_STATUS_API}/options`,
    }),
    } as const),
  });

export const {
  useGetWorkspaceOptionsQuery,
} = workspacesApi;
