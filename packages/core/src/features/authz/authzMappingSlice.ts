import { gen3Api } from '../gen3';
import { createSelector } from '@reduxjs/toolkit';
import { type AuthzMapping } from './types';
import { GEN3_AUTHZ_API } from '../../constants';

/**
 * Creates the authzApi for checking arborist permissions for a selected user
 * @see https://petstore.swagger.io/?url=https://raw.githubusercontent.com/uc-cdis/arborist/master/docs/openapi.yaml#/auth/get_auth_mapping
 * @see https://github.com/uc-cdis/arborist/blob/master/docs/relationships.simplified.png
 * @returns: An arborist response dict of user permissions {method, service} for each resource path.
 */
export const authzApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getAuthzMappings: builder.query<AuthzMapping, void>({
      query: () => `${GEN3_AUTHZ_API}/mapping`,
    }),
  }),
});

export const { useGetAuthzMappingsQuery } = authzApi;

export const selectAuthzMapping= authzApi.endpoints.getAuthzMappings.select();

export const selectAuthzMappingData = createSelector(
  selectAuthzMapping,
  authzMapping => authzMapping?.data ?? { mappings: [] }
);
