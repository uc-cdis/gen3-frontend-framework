import { gen3Api } from '../gen3';
import { GEN3_SUBMISSION_API } from '../../constants';
import {
  ProjectResponse,
  SubmissionGraphqlParams,
  SubmissionGraphqlResponse,
} from './types';
import { JSONObject } from '../../types';
import { extractValuesFromObject } from '../../utils/extractvalues';

export const submissionApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<ProjectResponse, JSONObject>({
      query: (graphQLParams) => ({
        url: `${GEN3_SUBMISSION_API}/graphql`,
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(graphQLParams),
      }),
      transformResponse: (response: Record<string, any>, _meta) => {
        return {
          projects: response.data.projects,
        };
      },
    }),
    getProjectDetails: builder.query<ProjectResponse, JSONObject>({
        async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
          // get a random user
          const singleResult = await fetchWithBQ({
            url: `${GEN3_SUBMISSION_API}/graphql`,
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(graphQLParams),
          })
          if (randomResult.error)
            return { error: randomResult.error as FetchBaseQueryError }
          const user = randomResult.data as User
          const result = await fetchWithBQ(`user/${user.id}/posts`)
          return result.data
            ? { data: result.data as Post }
            : { error: result.error as FetchBaseQueryError }
        },
    }),
    getGraphQL: builder.query<SubmissionGraphqlResponse, SubmissionGraphqlParams>({
      query: (graphQLParams) => ({
        url: `${GEN3_SUBMISSION_API}/graphql`,
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          query: graphQLParams.query,
          ...(graphQLParams.variables
            ? { variables: graphQLParams.variables }
            : {}),
        }),
      }),
      transformResponse: (response: Record<string, any>, _meta, params) => {
        if (params.mapping) {
          return {
            data: extractValuesFromObject(params.mapping, response.data)
          };
        }
        return response.data;
      },
    }),
  }),
});

export const { useGetProjectsQuery, useGetGraphQLQuery } = submissionApi;
