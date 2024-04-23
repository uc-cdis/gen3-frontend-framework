import { gen3Api } from '../gen3';
import { GEN3_SUBMISSION_API } from '../../constants';
import {
  Project,
  ProjectResponse,
  ProjectsListRequestParams,
  SubmissionInfo,
  SubmissionGraphqlParams,
  SubmissionGraphqlResponse,
} from './types';
import { JSONObject } from '../../types';
import { extractValuesFromObject } from '../../utils/extractvalues';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

interface ProjectFetchQueryResponse {
  data: {
    data: {
      project: Array<Project>;
    };
  };
}

/**
 * Project details from the project query
 */
interface ProjectInfoFromProjectDetails {
  name: string;
  id: string;
  code: string;
}

interface ProjectDetailsResponse
  extends Record<
    string,
    string | number | Array<ProjectInfoFromProjectDetails>
  > {
  project: Array<ProjectInfoFromProjectDetails>;
}

interface ProjectDetailsFetchQueryResponse {
  data: {
    data: ProjectDetailsResponse;
  };
}

/**
 *  Project details results a list of project details
 *  and the project information
 */
interface ProjectDetailsResults {
  [key: string]: string | number | ProjectInfoFromProjectDetails;
  project: ProjectInfoFromProjectDetails;
}

export interface ProjectDetailsQueryResponse {
  details: ProjectDetailsResults[];
  hits: number;
}

interface SubmissionQueryResponse {
  transactionList: SubmissionInfo[];
}

const SubmissionGraphqlQuery = `query transactionList {
    transactionList: transaction_log(last: 20) {
      id
      submitter
      project_id
      created_datetime
      documents {
        doc_size
        doc
        id
      }
      state
    }
}`;

/**
 * Defines submissionApi service using a base URL and expected endpoints. Derived from gen3Api core API.
 * @param endpoints - Defines endpoints used in submission page
 * @param getProjects - Queries the list of projects
 * @param getProjectsDetails - Queries the list of projects and their details
 * @param getSubmissionGraphQL - Queries the submission graphql with a query and variables
 * @returns: A submission API for fetching project details
 */
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
          projects: response.data.project,
        };
      },
    }),
    getSubmissions: builder.query<SubmissionQueryResponse, void>({
      query: () => ({
        url: `${GEN3_SUBMISSION_API}/graphql`,
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          query: SubmissionGraphqlQuery,
        }),
      }),
      transformResponse: (response: Record<string, any>, _meta) => {
        return {
          transactionList: response.data.transactionList,
        };
      },
    }),
    getProjectsDetails: builder.query<
      ProjectDetailsQueryResponse,
      ProjectsListRequestParams
    >({
      async queryFn(args, _queryApi, _extraOptions, fetchWithBQ) {
        // get the list of projects
        const projectsResponse = await fetchWithBQ({
          url: `${GEN3_SUBMISSION_API}/graphql`,
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify(args.projectQuery),
        });
        if (projectsResponse.error)
          return { error: projectsResponse.error as FetchBaseQueryError };

        const projects = (projectsResponse as ProjectFetchQueryResponse)?.data
          .data.project;
        const projectIds = projects.map((p) => p.project_id);

        // given the list of projects, get all of them by executing the projectDetailsQuery for each project
        const projectDetails = await Promise.all(
          projectIds.map(async (projectId) => {
            const result = await fetchWithBQ({
              url: `${GEN3_SUBMISSION_API}/graphql`,
              method: 'POST',
              credentials: 'include',
              body: JSON.stringify({
                ...args.projectDetailsQuery,
                variables: {
                  name: projectId,
                },
              }),
            });
            const { project, ...values } = (
              result as ProjectDetailsFetchQueryResponse
            ).data.data;

            return result.data
              ? {
                  data: args.mapping
                    ? ({
                        ...extractValuesFromObject(
                          args.mapping,
                          values as JSONObject,
                        ),
                        project: project[0],
                      } as ProjectDetailsResults)
                    : ({
                        ...values,
                        project: project[0],
                      } as ProjectDetailsResults),
                }
              : { error: result.error };
          }),
        );

        // if any of the projectDetails has an error, return the error
        if (projectDetails.some((detail) => 'error' in detail)) {
          return {
            error: projectDetails.find(
              (detail) => 'error' in detail,
            ) as FetchBaseQueryError,
          };
        } else
          return {
            data: {
              details: projectDetails.reduce((acc, detail) => {
                acc.push(
                  detail.data ?? {
                    project: {
                      name: '',
                      id: '',
                      code: '',
                    },
                  },
                );
                return acc;
              }, [] as ProjectDetailsResults[]),
              hits: projectIds.length, // TODO this needs to be changed to show the total number of projects
            },
          };
      },
    }),
    getSubmissionGraphQL: builder.query<
      SubmissionGraphqlResponse,
      SubmissionGraphqlParams
    >({
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
            data: extractValuesFromObject(params.mapping, response.data),
          };
        }
        return response.data;
      },
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetSubmissionGraphQLQuery,
  useGetProjectsDetailsQuery,
  useLazyGetProjectsQuery,
  useLazyGetSubmissionGraphQLQuery,
  useGetSubmissionsQuery,
} = submissionApi;
