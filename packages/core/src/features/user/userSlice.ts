import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchFence, Gen3FenceResponse } from '../fence';
import { CoreDispatch } from '../../store';
import { CoreState } from '../../reducers';
import {
  CoreDataSelectorResponse,
  createUseCoreDataHook,
  DataStatus,
} from '../../dataAccess';
import { useCoreDispatch, useCoreSelector } from '../../hooks';
import { useEffect } from 'react';
import { Gen3User, LoginStatus } from './types';
import { getCookie } from 'cookies-next';
import { selectCSRFToken } from './userSliceRTK';



export interface Gen3UserLoginResponse<T> {
  readonly data?: T;
  readonly error?: string;
  readonly loginStatus: LoginStatus;
  readonly isUninitialized: boolean;
  readonly isFetching: boolean;
  readonly isSuccess: boolean;
  readonly isError: boolean;
}

/**
 * Creates an async thunk for fetching user permissions details from fence
 * @see https://redux-toolkit.js.org/api/createAsyncThunk
 * @returns: A fence response dict containing user details
 */
export const fetchUserState = createAsyncThunk<
  Gen3FenceResponse<Gen3User>,
  void,
  { dispatch: CoreDispatch; state: CoreState }
>('fence/user/user', async (_, meta) => {

  // Get an access token from a cookie if in development mode
  const csrfToken = selectCSRFToken(meta.getState());
  let accessToken = undefined;
  if (process.env.NODE_ENV === 'development') {
    accessToken = getCookie('credentials_token');
  }

  return await fetchFence({
    endpoint: '/user/user',
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken} : {}),
      credentials: 'include',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
});


export const isAuthenticated = (loginStatus: LoginStatus): boolean =>
  loginStatus === 'authenticated';

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

/**
 * Wraps a slice on top of fetchUserState async thunk to keep track of
 * query state. authenticated/not-authenticated vs. ejected/fulfilled/pending
 * @returns: status messages wrapped around fetchUserState response dict
 */
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
        if (response.status !== 200) {
          return {
            status: 'rejected',
            loginStatus: 'unauthenticated',
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
  return useCoreSelector((state) =>
    isAuthenticated(selectUserLoginStatus(state)),
  );
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
