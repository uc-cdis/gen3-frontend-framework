import { GEN3_AI_SEARCH_API } from '../../constants';
import { gen3Api } from '../gen3';

interface Api32SearchParams {
  readonly query: string;
}

interface Api32SearchRequestParams extends Api32SearchParams {
  readonly topic?: string;
  readonly conversationId?: string;
}

export interface Api32SearchResponse extends Api32SearchParams {
  readonly topic: string;
  readonly conversationId: string;
  readonly response: string;
  readonly documents: {
    readonly page_content: string;
    readonly metadata: {
      readonly row: number;
      readonly source: string;
    };
  }[];
}

/**
 * returns a response from the AI search service
 * @param searchParams - the parameters for the AI search service
 * @returns the response from the AI search service
 */
export const api32SearchApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    searchAggregations: builder.query<
      Api32SearchResponse,
      Api32SearchRequestParams
    >({
      query: (searchParams: Api32SearchRequestParams) => ({
        url: `${GEN3_AI_SEARCH_API}/ask`,
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchParams.query,
          ...(searchParams.topic ? { topic: searchParams.topic } : {}),
          ...(searchParams.conversationId
            ? { conversation_id: searchParams.conversationId }
            : {}),
        }),
      }),
      transformResponse: (data: Record<string, any>, _, arg) => {
        return {
          query: arg.query,
          response: data.response,
          topic: data.topic,
          conversationId: data.conversation_id,
          documents: data.documents,
        };
      },
    }),
    /**
     * returns the status of the AI search service
     * @returns {
     *   status: string
     *   timestamp: string
     * }
     */
    getAISearchStatus: builder.query<Api32SearchResponse, void>({
      query: () => `${GEN3_AI_SEARCH_API}/_status`,
    }),
    getAISearchVersion: builder.query<Api32SearchResponse, void>({
      query: () => `${GEN3_AI_SEARCH_API}/_version`,
    }),
  }),
});

// Add more endpoints here

export const {
  useSearchAggregationsQuery,
  useGetAISearchStatusQuery,
  useGetAISearchVersionQuery,
} = api32SearchApi;
