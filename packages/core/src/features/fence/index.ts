import {
  type FetchRequest,
  type Gen3LoginProvider,
  type NameUrl,
  logoutFence,
  useGetLoginProvidersQuery,
  useGetDownloadQuery,
  useLazyGetDownloadQuery,
} from './fenceApi';

import {
  type APIKey,
  type Gen3FenceCredentials,
  useGetCredentialsQuery,
  useAddNewCredentialMutation,
  useRemoveCredentialMutation,
  useAuthorizeFromCredentialsMutation,
} from './credentialsApi';

import { useGetJWKKeysQuery } from './jwtApi';
import { FetchError, Gen3FenceResponse } from './types';
import { fetchFence, downloadJSONDataFromFence } from './utils';

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
  useGetCredentialsQuery,
  useGetDownloadQuery,
  useLazyGetDownloadQuery,
  useAddNewCredentialMutation,
  useRemoveCredentialMutation,
  useGetLoginProvidersQuery,
  useGetJWKKeysQuery,
  useAuthorizeFromCredentialsMutation,
  downloadJSONDataFromFence,
};
