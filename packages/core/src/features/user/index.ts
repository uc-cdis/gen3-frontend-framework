import {
  useUser,
  useUserAuth,
  resetUserState,
  fetchUserState,
  isAuthenticated,
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
import { type UserProfile, type LoginStatus, type Gen3User, type ExternalProvider } from './types';

export {
  useUser,
  useUserAuth,
  resetUserState,
  selectUser,
  selectUserData,
  selectUserLoginStatus,
  fetchUserState,
  isAuthenticated,
  useIsUserLoggedIn,
  useGetExternalLoginsQuery,
  type Gen3User,
  type LoginStatus,
  type UserProfile,
  useFetchUserDetailsQuery,
  useLazyFetchUserDetailsQuery,
  selectUserDetails,
  selectUserAuthStatus,
  useGetCSRFQuery,
  selectCSRFToken,
  selectCSRFTokenData,
  selectHeadersWithCSRFToken,
  type CSRFToken,
  type ExternalProvider
};
