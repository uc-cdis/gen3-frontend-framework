import { gen3Api, WorkspaceStatusResponse } from '@gen3/core';
import { GEN3_WORKSPACES_API } from '../constants';

const WorkspacesWithTags = gen3Api.enhanceEndpoints({
  addTagTypes: ['Workspaces'],
});

export const workspacesApi = WorkspacesWithTags.injectEndpoints({
  endpoints: (builder) => ({
    workspacesStatus: builder.query<WorkspaceStatusResponse, string>({
      query: (id) => `${GEN3_WORKSPACES_API}/status?id=${id}`,
    }),
  }),
});

export const { useWorkspacesStatusQuery } = workspacesApi;
