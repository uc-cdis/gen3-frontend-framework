import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CoreState } from '../../reducers';

export interface AuthState {
  csrf?: string;
  accessToken?: string;
}

const initialState : AuthState = {
  csrf: undefined,
  accessToken: undefined,
};

const slice =  createSlice({
  name: 'authState',
  initialState,
  reducers: {
    setCSRF: (
      state: AuthState,
      action: PayloadAction<{ csrf: string }>,
    ) => {
      return { ...state, csrf: action.payload.csrf };
    },
    setAccessToken: (state: AuthState, action: PayloadAction<{ accessToken: string }>) => {
      return { ...state, accessToken: action.payload.accessToken };
    },
  },
});


export const authReducer = slice.reducer;
export const { setCSRF, setAccessToken } = slice.actions;

export const selectAuthCSRF = (state: CoreState): string | undefined =>
  state.auth.csrf;

export const selectAccessToken = (state: CoreState): string | undefined =>
  state.auth.accessToken;
