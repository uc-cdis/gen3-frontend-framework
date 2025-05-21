import {
  useUserAuth,
  resetUserState,
  fetchUserState,
  selectUser,
  selectUserData,
  selectUserLoginStatus,
  useIsUserLoggedIn,
} from './userSlice';

import {
  useFetchUserDetailsQuery,
  useLazyFetchUserDetailsQuery,
  useGetCSRFQuery,
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

import { isAuthenticated, isPending } from './utils';

import { getFederatedLoginStatus, useGetFederatedLoginStatus } from './hooks';
import {
  selectCSRFToken,
  selectCSRFTokenData,
  selectHeadersWithCSRFToken,
  selectUserAuthStatus,
  selectUserDetails,
} from './userSelectorsRTK';

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
  useIsUserLoggedIn,
  resetUserState,
  isAuthenticated,
  isPending,
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
