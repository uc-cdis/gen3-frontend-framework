import { gen3Api } from '../gen3';
import { JSONObject} from '../../types';


const graphQLWithTags = gen3Api.enhanceEndpoints({
  addTagTypes: ['graphQL'],
});

export const graphQLAPI = graphQLWithTags.injectEndpoints({
  endpoints: (builder) => ({
    graphQL: builder.query<JSONObject, JSONObject>({
      query: (graphQLParams ) => ({
        url: '/graphql',
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphQLParams),
      })
    })
  })
});

export const {
  useGraphQLQuery
} = graphQLAPI;
