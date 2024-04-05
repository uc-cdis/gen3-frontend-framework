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
  useLazyFetchUserDetailsQuery
} from './userSliceRTK';

import { useGetExternalLoginsQuery } from './externalLoginsSlice';
import { type UserProfile, type LoginStatus, type Gen3User, type ExternalProvider, type NamedURL } from './types';

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
  useLazyFetchUserDetailsQuery
};
