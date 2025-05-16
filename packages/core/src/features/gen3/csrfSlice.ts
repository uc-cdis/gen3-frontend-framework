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
        console.log('fetch csrf call', jsonData);
        return jsonData?.csrf ?? null;
      },
      {
        pending: (state) => {
          console.log("pending action.payload")
          state.loading = true;
          state.error = null;
        },
        rejected: (state, action) => {
          console.log('rejected action.payload:', action);
          state.loading = false;
          state.error =
            action.error.message ??
            'Unknown error getting CSRF token from Gen3';
        },
        fulfilled: (state, action) => {
          console.log('fulfilled action.payload:', action);
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
