import {
  useUser,
  useUserAuth,
  resetUserState,
  fetchUserState,
  isAuthenticated,
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

import { useGetExternalLoginsQuery } from './externalLoginsSlice';
import {
  type UserProfile,
  type LoginStatus,
  type Gen3User,
  type ExternalProvider,
  type NamedURL,
  type JWTSessionStatus,
} from './types';

export {
  type Gen3User,
  type LoginStatus,
  type UserProfile,
  type JWTSessionStatus,
  type CSRFToken,
  type ExternalProvider,
  type NamedURL,
  useUser,
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
  selectUserDetails,
  selectUserAuthStatus,
  useGetCSRFQuery,
  selectCSRFToken,
  selectCSRFTokenData,
  selectHeadersWithCSRFToken,
};
