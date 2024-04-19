import { gen3Api } from '../gen3';
import { GEN3_SUBMISSION_API } from '../../constants';
import { ProjectResponse } from './types';
import { JSONObject } from '../../types';

export const submissionApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<ProjectResponse, JSONObject>({
      query: (graphQLParams) => ({
        url :  `${GEN3_SUBMISSION_API}/graphql`,
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(graphQLParams),
      }),
      transformResponse: (response: Record<string, any>, _meta) => {
        return {
          projects: response.data.projects,
        };
      }
    })
  }),
});

export const { useGetProjectsQuery } = submissionApi;
