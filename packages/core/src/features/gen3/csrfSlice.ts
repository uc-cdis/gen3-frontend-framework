import { buildCreateSlice, asyncThunkCreator } from '@reduxjs/toolkit';
import { GEN3_API } from '../../constants';

export const createCoreSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

export interface CSRFState {
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: CSRFState = {
  token: null,
  loading: false,
  error: null,
};

// Slice
const csrfSlice = createCoreSlice({
  name: 'csrfToken',
  initialState,
  reducers: (create) => ({
    fetchCSRFToken: create.asyncThunk(
      async () => {
        const response = await fetch(`${GEN3_API}/_status`, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });

        const jsonData = await response.json();
        return jsonData?.csrf ?? null;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error =
            action.error.message ??
            'Unknown error getting CSRF token from Gen3';
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.token = action.payload;
          state.error = null;
        },
      },
    ),
  }),
});

export const { fetchCSRFToken } = csrfSlice.actions;
export const csrfReducer = csrfSlice.reducer;

// Selectors
export const selectCSRFTokenFromState = (state: { csrf: CSRFState }) =>
  state.csrf.token;

export const selectCSRFLoadingFromState = (state: { csrf: CSRFState }) =>
  state.csrf.loading;
