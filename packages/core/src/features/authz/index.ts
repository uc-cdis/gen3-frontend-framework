import {
  type ServiceAndMethod,
  type AuthzMapping,
  type ResourceAuthzMapping,
} from './types';
import {
  useGetAuthzMappingsQuery,
  useLazyGetAuthzMappingsQuery,
  useCreateAuthzResourceMutation,
  useGetAuthzResourcesQuery,
  useLazyGetAuthzResourcesQuery,
  selectAuthzMappingData,
} from './authzMappingSlice';

export {
  useGetAuthzMappingsQuery,
  useLazyGetAuthzMappingsQuery,
  useCreateAuthzResourceMutation,
  useGetAuthzResourcesQuery,
  useLazyGetAuthzResourcesQuery,
  selectAuthzMappingData,
  type ServiceAndMethod,
  type AuthzMapping,
  type ResourceAuthzMapping,
};
