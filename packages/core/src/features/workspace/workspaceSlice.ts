import { gen3Api } from "../gen3";
import { GEN3_WORKSPACE_API } from "../../constants";

export interface WorkspaceOptionsResponse {

}

export const workspaceApi = gen3Api.injectEndpoints({
    endpoints: (builder) => ({
      getWorkspaceOptions: builder.query<WorkspaceOptionsResponse, void>({
        query: () => ({
            url: `${GEN3_WORKSPACE_API}/options`,
            method: 'GET'
          }),
        // transformResponse: (response: Record<string, any>, _meta) => {
        //     console.log('res', response);
        //   return {

        //   };
        // },
      })})
    });

export const { useGetWorkspaceOptionsQuery } = workspaceApi;
