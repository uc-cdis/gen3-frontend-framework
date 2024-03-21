import { gen3Api } from '../gen3';
import { JSONObject } from '../../types';
import { GEN3_GUPPY_API } from '../../constants';

export const graphQLWithTags = gen3Api.enhanceEndpoints({
  addTagTypes: ['graphQL'],
});

/**
 * Creates a graphQLAPI for graphql queries to elasticsearch indices via guppy
 * @see https://github.com/uc-cdis/guppy/blob/master/doc/queries.md
 * @param query - Resolver function which configures the graphql query with graphQLParams argument
 * @returns: A guppy search API for fetching metadata
 */
export const graphQLAPI = graphQLWithTags.injectEndpoints({
  endpoints: (builder) => ({
    graphQL: builder.query<JSONObject, JSONObject>({
      query: (graphQLParams) => ({
        url: `${GEN3_GUPPY_API}/guppy/graphql`,
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
