import {
  type FetchError,
  type FetchRequest,
  type Gen3FenceResponse,
  type Gen3LoginProvider,
  type NameUrl,
  fetchFence,
  useGetLoginProvidersQuery,
} from './fenceApi';

import {
  type APIKey,
  type Gen3FenceCredentials,
  useGetCredentialsQuery,
  useAddNewCredentialMutation,
  useRemoveCredentialMutation,
} from './credentialsApi';

export {
  type Gen3FenceResponse,
  type FetchError,
  type FetchRequest,
  type APIKey,
  type Gen3FenceCredentials,
  type Gen3LoginProvider,
  type NameUrl,
  fetchFence,
  useGetCredentialsQuery,
  useAddNewCredentialMutation,
  useRemoveCredentialMutation,
  useGetLoginProvidersQuery,
};
