import { gen3Api } from '../gen3';
import { createSelector } from '@reduxjs/toolkit';
import {
  type AuthzMapping,
  AuthzResourceResponse,
  CreateAuthzResourceRequest,
  CreateAuthzResourceResponse,
} from './types';
import { GEN3_AUTHZ_API } from '../../constants';

const TAGS = 'authz';

export const authzTags = gen3Api.enhanceEndpoints({
  addTagTypes: [TAGS],
});

/**
 * Creates the authzApi for checking arborist permissions for a selected user
 * @see https://petstore.swagger.io/?url=https://raw.githubusercontent.com/uc-cdis/arborist/master/docs/openapi.yaml#/auth/get_auth_mapping
 * @see https://github.com/uc-cdis/arborist/blob/master/docs/relationships.simplified.png
 * @returns: An arborist response dict of user permissions {method, service} for each resource path.
 */
export const authzApi = authzTags.injectEndpoints({
  endpoints: (builder) => ({
    getAuthzMappings: builder.query<AuthzMapping, void>({
      query: () => `${GEN3_AUTHZ_API}/mapping`,
    }),
    getAuthzResources: builder.query<AuthzResourceResponse, void>({
      query: () => ({
        url: `${GEN3_AUTHZ_API}/resources`,
        method: 'GET',
      }),
    }),
    createAuthzResource: builder.mutation<
      CreateAuthzResourceResponse,
      CreateAuthzResourceRequest
    >({
      query: (request) => ({
        // url: `${GEN3_AUTHZ_API}/resources/${request.resourcePath}${request?.path ? `&p=${request.path}` : ''}`,
        url: `${GEN3_AUTHZ_API}/resources`,
        method: 'POST',
        body: request.data,
      }),
      invalidatesTags: [TAGS],
    }),
  }),
});

export const {
  useGetAuthzMappingsQuery,
  useLazyGetAuthzMappingsQuery,
  useGetAuthzResourcesQuery,
  useLazyGetAuthzResourcesQuery,
  useCreateAuthzResourceMutation,
} = authzApi;

export const selectAuthzMapping = authzApi.endpoints.getAuthzMappings.select();

export const selectAuthzMappingData = createSelector(
  selectAuthzMapping,
  (authzMapping) => authzMapping?.data ?? { mappings: [] },
);
