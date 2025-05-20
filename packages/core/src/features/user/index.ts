import {
  useUserAuth,
  resetUserState,
  fetchUserState,
  isPending,
  selectUser,
  selectUserData,
  selectUserLoginStatus,
  useIsUserLoggedIn,
} from './userSlice';

import {
  useFetchUserDetailsQuery,
  useLazyFetchUserDetailsQuery,
  selectUserDetails,
  selectUserAuthStatus,
  useGetCSRFQuery,
  selectCSRFToken,
  selectCSRFTokenData,
  selectHeadersWithCSRFToken,
  type CSRFToken,
} from './userSliceRTK';

import {
  useGetExternalLoginsQuery,
  useLazyGetExternalLoginsQuery,
  useLazyIsExternalConnectedQuery,
  useIsExternalConnectedQuery,
} from './externalLoginsSlice';
import {
  type UserProfile,
  type LoginStatus,
  type Gen3User,
  type ExternalProvider,
  type NamedURL,
  type JWTSessionStatus,
} from './types';

import { getFederatedLoginStatus, useGetFederatedLoginStatus } from './hooks';
import { isAuthenticated } from './utils';

export {
  type Gen3User,
  type LoginStatus,
  type UserProfile,
  type JWTSessionStatus,
  type CSRFToken,
  type ExternalProvider,
  type NamedURL,
  useUserAuth,
  selectUser,
  selectUserData,
  selectUserLoginStatus,
  fetchUserState,
  isAuthenticated,
  isPending,
  useIsUserLoggedIn,
  resetUserState,
  useGetExternalLoginsQuery,
  useFetchUserDetailsQuery,
  useLazyFetchUserDetailsQuery,
  useLazyGetExternalLoginsQuery,
  useLazyIsExternalConnectedQuery,
  useIsExternalConnectedQuery,
  selectUserDetails,
  selectUserAuthStatus,
  useGetCSRFQuery,
  selectCSRFToken,
  selectCSRFTokenData,
  selectHeadersWithCSRFToken,
  getFederatedLoginStatus,
  useGetFederatedLoginStatus,
};
