import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { castDraft } from 'immer';
import { fetchCSRF } from './csrfApi';
import type { CSRFToken } from './csrfApi';
import { CoreDataSelectorResponse, createUseCoreDataHook, DataStatus, Gen3Response } from '../../dataAccess';
import { CoreDispatch } from '../../store';
import { CoreState } from '../../reducers';

export const fetchCSRFToken = createAsyncThunk<
  Gen3Response<string>,
  string,
  { dispatch: CoreDispatch; state: CoreState }
  >('gen3/csrf', async (hostname: string) => await fetchCSRF(hostname)
  );


export interface CSRFTokenState extends CSRFToken {
  readonly status: DataStatus;
  readonly error?: string;
}

const initialState : CSRFTokenState  = {
  csrfToken: '',
  status: 'uninitialized'
};


const slice = createSlice({
  name: 'csrfToken',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCSRFToken.fulfilled, (state, action) => {
        const response = action.payload;
        if (response.errors) {
          state = castDraft(initialState);
          state.status = 'rejected';
          state.error = response.errors.filters;
        }
        state = {
          csrfToken: response.data,
          status: 'fulfilled'
        };
        return state;
      })
      .addCase(fetchCSRFToken.pending, (state ) => {
        state.status =  'pending';
      })
      .addCase(fetchCSRFToken.rejected, (state) => {
        state.status =  'rejected';
      }
      );
  },
});


export const csrfTokenReducer = slice.reducer;

export const selectCSRFTokenState = (state: CoreState): CSRFTokenState => state.csrf;

export const selectCSRFToken = (
  state: CoreState,
): string => {
  return state.csrf.csrfToken;
};

export const selectCSRFTokenData = (
  state: CoreState,
): CoreDataSelectorResponse<string> => {
  return {
    data: state.csrf.csrfToken,
    status: state.csrf.status,
    error: state.csrf.error,
  };
};

export const useCSRFToken = createUseCoreDataHook(
  fetchCSRFToken,
  selectCSRFTokenData,
);
