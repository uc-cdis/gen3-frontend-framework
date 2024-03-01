import { gen3Api } from '../gen3';

export interface JWTKeys {
  keys: ReadonlyArray<string[2]>
}

// extending the gen3API to add a tag to the endpoints
const credentialsWithTags = gen3Api.enhanceEndpoints({
  addTagTypes: ['fenceJWT'],
});


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
