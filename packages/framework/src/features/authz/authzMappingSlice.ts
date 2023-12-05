import { gen3Api } from '../gen3';
import { type AuthzMapping } from './types';

export const authzApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getAuthzMappings: builder.query<AuthzMapping, void>({
      query: () => 'authz/mapping',
    }),
  }),
});

export const { useGetAuthzMappingsQuery } = authzApi;
