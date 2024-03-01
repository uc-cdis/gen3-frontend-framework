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

interface AuthorizeFromCredentialsParams {
  api_key: string;
  key_id: string;
}
export interface AuthTokenResponse {
  access_token: string;
}

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
          ...(csrfToken && { 'x-csrf-token': csrfToken }),
        },
      }),
      invalidatesTags: ['Credentials'],
    }),
    authorizeFromCredentials: builder.mutation<AuthTokenResponse, AuthorizeFromCredentialsParams>({
      query: (params) => ({
        url: '/user/credentials/api/access_token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          api_key: params.api_key,
          key_id: params.key_id,
        },
      }),
    }),
  })
});

export const {
  useGetCredentialsQuery,
  useAddNewCredentialMutation,
  useRemoveCredentialMutation,
  useAuthorizeFromCredentialsMutation
} = credentialsApi;
