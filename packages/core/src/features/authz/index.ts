import {
  type ServiceAndMethod,
  type AuthzMapping,
  type ResourceAuthzMapping,
} from './types';
import {
  useGetAuthzMappingsQuery,
  useLazyGetAuthzMappingsQuery,
  selectAuthzMappingData,
} from './authzMappingSlice';

export {
  useGetAuthzMappingsQuery,
  useLazyGetAuthzMappingsQuery,
  selectAuthzMappingData,
  type ServiceAndMethod,
  type AuthzMapping,
  type ResourceAuthzMapping,
};
