import {
  fetchUserState,
  isAuthenticated,
  isPending,
  resetUserState,
  selectUser,
  selectUserData,
  selectUserLoginStatus,
  useIsUserLoggedIn,
  useUserAuth,
} from './userSlice';

import {
  type CSRFToken,
  selectCSRFToken,
  selectCSRFTokenData,
  selectHeadersWithCSRFToken,
  selectUserAuthStatus,
  selectUserDetails,
  useFetchUserDetailsQuery,
  useGetCSRFQuery,
  useGetUserDetailsRequestStatus,
  useLazyFetchUserDetailsQuery,
  useLazyGetCSRFQuery,
} from './userSliceRTK';

import {
  useGetExternalLoginsQuery,
  useIsExternalConnectedQuery,
  useLazyGetExternalLoginsQuery,
  useLazyIsExternalConnectedQuery,
} from './externalLoginsSlice';
import {
  type ExternalProvider,
  type Gen3User,
  type JWTSessionStatus,
  type LoginStatus,
  type NamedURL,
  type UserProfile,
} from './types';

import { getFederatedLoginStatus, useGetFederatedLoginStatus } from './hooks';

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
  useLazyGetCSRFQuery,
  selectCSRFToken,
  selectCSRFTokenData,
  selectHeadersWithCSRFToken,
  getFederatedLoginStatus,
  useGetFederatedLoginStatus,
  useGetUserDetailsRequestStatus,
};
