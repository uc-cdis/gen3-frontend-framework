import { gen3Api } from '../gen3';
import { JSONObject } from '../../types';

export const graphQLWithTags = gen3Api.enhanceEndpoints({
  addTagTypes: ['graphQL'],
});

export const graphQLAPI = graphQLWithTags.injectEndpoints({
  endpoints: (builder) => ({
    graphQL: builder.query<JSONObject, JSONObject>({
      query: (graphQLParams) => ({
        url: '/graphql',
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(graphQLParams),
      }),
    }),
  }),
});

export const { useGraphQLQuery } = graphQLAPI;
