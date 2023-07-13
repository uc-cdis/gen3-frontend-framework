import { GEN3_DOMAIN } from './constants';
import {
  useUser,
  useUserAuth,
  type LoginStatus,
  type Gen3User,
  selectUser,
  fetchUserState,
  selectUserAuthenticationStatus,
  selectUserData,
} from './features/user';
import { type CoreState } from './reducers';

export * from './types';
export * from './store';
export * from './hooks';
export * from './dataAccess';
export * from './provider';
export * from './features/metadata/metadataSlice';
export * from './features/fence';
export * from './features/gen3Apps';
export { gen3Api } from './features/gen3';

export {
  useUser,
  useUserAuth,
  selectUser,
  selectUserData,
  fetchUserState,
  type LoginStatus,
  type CoreState,
  type Gen3User,
  selectUserAuthenticationStatus,
  GEN3_DOMAIN,
};
