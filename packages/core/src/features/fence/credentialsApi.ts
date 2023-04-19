import { gen3Api } from "../gen3/gen3Api";

export interface APIKey {
  readonly jti: string;
  readonly exp: string;
}
export interface Gen3FenceCredentials {
  readonly jtis: ReadonlyArray<APIKey>;
}

// extending the gen3API to add a tag to the endpoints
const credentialsWithTags = gen3Api.enhanceEndpoints({
  addTagTypes: ["Credentials"],
});

export const credentialsApi = credentialsWithTags.injectEndpoints({
  endpoints: (builder) => ({
    getCredentials: builder.query<ReadonlyArray<APIKey>, void>({
      query: () => "user/credentials/api",
      transformResponse: (
        response: Gen3FenceCredentials,
      ): ReadonlyArray<APIKey> => response["jtis"], // the response is a JSON object with a single key,
      // "jtis", which is an array of API keys
      // no need to transform the response, since the API returns the correct format
      providesTags: ["Credentials"],
    }),
    addNewCredential: builder.mutation({
      query: (csrfToken:string) => ({
        url: "user/credentials/api",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        body: {
          scope: ["user", "data"],
        },
      }),
      invalidatesTags: ["Credentials"],
    }),
  }),
});

export const { useGetCredentialsQuery, useAddNewCredentialMutation } =
  credentialsApi;
