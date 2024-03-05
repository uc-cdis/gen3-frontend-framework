import { gen3Api } from '../gen3';
import { GEN3_AUTH_API } from '../../constants';

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

export const credentialsApi = credentialsWithTags.injectEndpoints({
  endpoints: (builder) => ({
    getCredentials: builder.query<ReadonlyArray<APIKey>, void>({
      query: () => `${GEN3_AUTH_API}/credentials/api`,
      transformResponse: (
        response: Gen3FenceCredentials,
      ): ReadonlyArray<APIKey> => response['jtis'], // the response is a JSON object with a single key,
      // "jtis", which is an array of API keys
      // no need to transform the response, since the API returns the correct format
      providesTags: ['Credentials'],
    }),
    addNewCredential: builder.mutation({
      query: (csrfToken: string) => ({
        url: `${GEN3_AUTH_API}/credentials/api`,
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
        url: `${GEN3_AUTH_API}/credentials/api/${id}`,
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
