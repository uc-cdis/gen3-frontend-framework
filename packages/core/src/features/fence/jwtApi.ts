import { gen3Api } from '../gen3';

export interface JWTKeys {
  keys: ReadonlyArray<string[2]>
}

// extending the gen3API to add a tag to the endpoints
const credentialsWithTags = gen3Api.enhanceEndpoints({
  addTagTypes: ['fenceJWT'],
});

/**
 * A fence API for getting the public keys which can be used to validate
 * JWTs issued and signed by fence
 * @returns: Fence public keys
 */
export const jwtApi = credentialsWithTags.injectEndpoints({
  endpoints: (builder) => ({
    getJWKKeys: builder.query<ReadonlyArray<JWTKeys>, void>({
      query: () => 'user/jwt/keys',
      providesTags: ['fenceJWT'],
    }),
  }),
});

export const {
  useGetJWKKeysQuery,
} = jwtApi;
