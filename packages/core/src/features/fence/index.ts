import {
  type Gen3LoginProvider,
  logoutFence,
  type NameUrl,
  type PresignedUrlResponse,
  useGetDownloadQuery,
  useGetLoginProvidersQuery,
  useGetPresignedUrlQuery,
  useLazyGetDownloadQuery,
  useLazyGetFenceServiceStatusQuery,
  useLazyGetPresignedUrlQuery,
} from './fenceApi';

import {
  type APIKey,
  type Gen3FenceCredentials,
  useAddNewCredentialMutation,
  useAuthorizeFromCredentialsMutation,
  useGetCredentialsQuery,
  useRemoveCredentialMutation,
} from './credentialsApi';

import { useGetJWKKeysQuery, useLazyGetJWKKeysQuery } from './jwtApi';
import { FetchError, FetchRequest, Gen3FenceResponse } from './types';
import { isFetchError } from './utils';
import { fetchFence } from './fetchFence';

export {
  type Gen3FenceResponse,
  type FetchError,
  type FetchRequest,
  type APIKey,
  type Gen3FenceCredentials,
  type Gen3LoginProvider,
  type NameUrl,
  type PresignedUrlResponse,
  fetchFence,
  logoutFence,
  isFetchError,
  useGetCredentialsQuery,
  useGetDownloadQuery,
  useLazyGetDownloadQuery,
  useAddNewCredentialMutation,
  useRemoveCredentialMutation,
  useGetLoginProvidersQuery,
  useGetJWKKeysQuery,
  useLazyGetJWKKeysQuery,
  useAuthorizeFromCredentialsMutation,
  useGetPresignedUrlQuery,
  useLazyGetPresignedUrlQuery,
  useLazyGetFenceServiceStatusQuery,
};
