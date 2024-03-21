import { gen3Api } from '../gen3';

export interface APIKey {
  readonly jti: string;
  readonly exp: number;
}
export interface Gen3FenceCredentials {
  readonly jtis: ReadonlyArray<APIKey>;
}

// extending the gen3API to add a tag to the endpoints
const credentialsWithTags = gen3Api.enhanceEndpoints({
  addTagTypes: ['Credentials'],
});

interface DeleteCredentialParams {
  readonly csrfToken?: string;
  readonly id: string;
}

/**
 * Adds a credentialsApi into the base gen3Api
 * @endpoints Includes get, add, and remove credential operations
 *   @see https://github.com/uc-cdis/fence/blob/master/openapis/swagger.yaml#L972-L1033
  *  @param getCredentials - List all the API keys for the current user
  *  @param addNewCredential - Get a new API key for the current user
  *  @param removeCredential - Delete API access key with given ID for current user
 * @returns: A fence credential API for manipulating user credentials
 */
export const credentialsApi = credentialsWithTags.injectEndpoints({
  endpoints: (builder) => ({
    getCredentials: builder.query<ReadonlyArray<APIKey>, void>({
      query: () => 'user/credentials/api',
      transformResponse: (
        response: Gen3FenceCredentials,
      ): ReadonlyArray<APIKey> => response['jtis'], // the response is a JSON object with a single key,
      // "jtis", which is an array of API keys
      // no need to transform the response, since the API returns the correct format
      providesTags: ['Credentials'],
    }),
    addNewCredential: builder.mutation({
      query: (csrfToken: string) => ({
        url: 'user/credentials/api',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: {
          scope: ['user', 'data'],
        },
      }),
      invalidatesTags: ['Credentials'],
    }),
    removeCredential: builder.mutation<void, DeleteCredentialParams>({
      query: ({ csrfToken, id }) => ({
        url: `user/credentials/api/${id}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken &&  {'x-csrf-token': csrfToken}),
        },
      }),
      invalidatesTags: ['Credentials'],
    }),
  }),
});

export const {
  useGetCredentialsQuery,
  useAddNewCredentialMutation,
  useRemoveCredentialMutation,
} = credentialsApi;
