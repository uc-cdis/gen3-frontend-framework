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
  type LoginStatus,
  type Gen3User,
} from './userSlice';

import { useGetExternalLoginsQuery } from './externalLoginsSlice';
import { UserProfile } from './types';

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
};
