import { gen3Api } from '../gen3';
import { type AuthzMapping } from './types';

/**
 * Creates the authzApi for checking arborist permissions for a selected user
 * @see https://petstore.swagger.io/?url=https://raw.githubusercontent.com/uc-cdis/arborist/master/docs/openapi.yaml#/auth/get_auth_mapping
 * @see https://github.com/uc-cdis/arborist/blob/master/docs/relationships.simplified.png
 * @returns: An arborist response dict of user permissions {method, service} for each resource path.
 */
export const authzApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getAuthzMappings: builder.query<AuthzMapping, void>({
      query: () => 'authz/mapping',
    }),
  }),
});

export const { useGetAuthzMappingsQuery } = authzApi;
