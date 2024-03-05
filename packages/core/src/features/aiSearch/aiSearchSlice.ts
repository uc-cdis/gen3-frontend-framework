import { GEN3_AI_SEARCH_API } from '../../constants';
import { gen3Api } from '../gen3';

interface AiSearchRequestParams {
  readonly topic?: string;
  readonly conversationId?: string;
  readonly query: string;
}

export interface AiSearchDocument {
  readonly page_content: string;
  readonly metadata: {
    readonly row: number;
    readonly source: string;
  };
}

export interface AiSearchResponse {
  readonly query: string;
  readonly topic: string;
  readonly conversationId: string;
  readonly response: string;
  readonly documents: AiSearchDocument[];
}

/**
 * returns a response from the AI search service
 * @param searchParams - the parameters for the AI search service
 * @returns the response from the AI search service
 */
export const aiSearchApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    askQuestion: builder.mutation<AiSearchResponse, AiSearchRequestParams>({
      query: (searchParams: AiSearchRequestParams) => ({
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
          ...(searchParams.conversationId ? { conversation_id: searchParams.conversationId } : {}),
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
    getAISearchStatus: builder.query<AiSearchResponse, void>({
      query: () => `${GEN3_AI_SEARCH_API}/_status`,
    }),
    getAISearchVersion: builder.query<AiSearchResponse, void>({
      query: () => `${GEN3_AI_SEARCH_API}/_version`,
    }),
  })
});

// Add more endpoints here

export const {
  useAskQuestionMutation,
  useGetAISearchStatusQuery,
  useGetAISearchVersionQuery
} = aiSearchApi;
