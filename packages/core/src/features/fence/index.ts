import {
  type Gen3LoginProvider,
  logoutFence,
  type NameUrl,
  useGetDownloadQuery,
  useGetLoginProvidersQuery,
  useGetPresignedUrlQuery,
  useLazyGetDownloadQuery,
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

import { useGetJWKKeysQuery } from './jwtApi';
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
  useAuthorizeFromCredentialsMutation,
  useGetPresignedUrlQuery,
  useLazyGetPresignedUrlQuery,
};
