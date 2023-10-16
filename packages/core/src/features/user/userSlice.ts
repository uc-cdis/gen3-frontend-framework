import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchFence, Gen3FenceResponse } from '../fence';
import { CoreDispatch } from '../../store';
import { CoreState } from '../../reducers';
import { GEN3_API } from '../../constants';
import {
  CoreDataSelectorResponse,
  createUseCoreDataHook,
  DataStatus,
} from '../../dataAccess';
import { useCoreDispatch, useCoreSelector } from '../../hooks';
import { useEffect } from 'react';

interface UserProfile {
  id: number;
  user_id: number;
  username: string;
  email: string;
  role: string;
  is_admin: boolean;
  project_access: {
    [key: string]: string[];
  };
  phone_number: string;
  display_name: string;
  preferred_username: string;
  ga4gh_passport_v1: Record<string, string>[];
  certificates_uploaded: Record<string, string>[];
  primary_google_service_account: null;
  resources_granted: Record<string, string>[];
  groups: string[];

  message: string;
  sub: string;
  idp: string;
  azp: string[];
}

export type Gen3User = Partial<UserProfile>;

export interface Gen3UserLoginResponse<T> {
  readonly data?: T;
  readonly error?: string;
  readonly loginStatus: LoginStatus;
  readonly isUninitialized: boolean;
  readonly isFetching: boolean;
  readonly isSuccess: boolean;
  readonly isError: boolean;
}

export const fetchUserState = createAsyncThunk<
  Gen3FenceResponse<Gen3User>,
  void,
  { dispatch: CoreDispatch; state: CoreState }
>('fence/user', async () => {
  return await fetchFence({
    hostname: `${GEN3_API}`,
    endpoint: '/user/user',
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      credentials: 'include',
    },
  });
});

export type LoginStatus = 'authenticated' | 'unauthenticated' | 'pending';


export const isAuthenticated = (loginStatus: LoginStatus): boolean => loginStatus === 'authenticated';

export interface Gen3UserState {
  readonly data?: Gen3User;
  readonly status: DataStatus;
  readonly loginStatus: LoginStatus;
  readonly error?: string;
}

const initialState: Gen3UserState = {
  status: 'uninitialized',
  loginStatus: 'unauthenticated',
  error: undefined,
};

const slice = createSlice({
  name: 'fence/user',
  initialState,
  reducers: {
    resetUserState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserState.fulfilled, (_, action) => {
        const response = action.payload;
        if (response.errors) {
          return {
            status: 'rejected',
            loginStatus: 'unauthenticated',
            error: response.errors.filters,
          };
        }

        return {
          data: { ...response.data },
          status: 'fulfilled',
          loginStatus: 'authenticated',
        };
      })
      .addCase(fetchUserState.pending, () => {
        return { status: 'pending', loginStatus: 'unauthenticated' };
      })
      .addCase(fetchUserState.rejected, () => {
        return { status: 'rejected', loginStatus: 'unauthenticated' };
      });
  },
});

export const userReducer = slice.reducer;

export const { resetUserState } = slice.actions;

export interface Gen3UserSelectorResponse<T>
  extends CoreDataSelectorResponse<T> {
  readonly loginStatus: LoginStatus;
}

export const selectUserData = (
  state: CoreState,
): Gen3UserSelectorResponse<Gen3User> => {
  return state.user;
};

export const selectUser = (state: CoreState): Gen3UserState => state.user;

export const selectUserLoginStatus = (state: CoreState): LoginStatus =>
  state.user.loginStatus;

export const useUser = createUseCoreDataHook(fetchUserState, selectUserData);

export const useIsUserLoggedIn = (): boolean => {
  return useCoreSelector((state) => isAuthenticated(selectUserLoginStatus(state)));
};

/**
 * Hook to return get the authenticated state of the user and if logged in,
 * the user's profile and access api.
 * Note that if fetchUserState gets called, the user's session is renewed.
 */
export const useUserAuth = (renew = false): Gen3UserLoginResponse<Gen3User> => {
  const coreDispatch = useCoreDispatch();
  const { data, status, loginStatus, error } = useCoreSelector(selectUserData);

  useEffect(() => {
    if (status === 'uninitialized' || renew) {
      // TODO: need to determine what other states require dispatch
      coreDispatch(fetchUserState());
    }
  }, [status, coreDispatch, renew]);

  return {
    data: data,
    error,
    loginStatus,
    isUninitialized: status === 'uninitialized',
    isFetching: status === 'pending',
    isSuccess: status === 'fulfilled',
    isError: status === 'rejected',
  };
};
