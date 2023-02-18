import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchFence,
  Gen3FenceResponse, selectCSRFToken,
} from "../fence";
import { CoreDispatch } from "../../store";
import { CoreState } from "../../reducers";
import { castDraft } from "immer";
import { GEN3_DOMAIN } from "../../constants";
import {
  CoreDataSelectorResponse,
  createUseCoreDataHook,
  DataStatus,
} from "../../dataAccess";



export type Gen3User = {
  username?: string;
  expiredAt?: number;
  accessToken?: string;
  avatar?: string;
  id?: string;
};


interface Gen3FenceUserResponse {
  data: Gen3User;
}

export interface UseGen3UserResponse<T> {
  readonly data?: T;
  readonly error?: string;
  readonly isUninitialized: boolean;
  readonly isFetching: boolean;
  readonly isAuthenticated: boolean;
  readonly isError: boolean;
}


export const fetchUserState = createAsyncThunk<
  Gen3FenceResponse<Gen3FenceUserResponse>,
  void,
  { dispatch: CoreDispatch; state: CoreState }
>("fence/user/user", async (_1, thunkAPI) => {
  const csrfToken = selectCSRFToken(thunkAPI.getState());
  return await fetchFence({
    hostname: `${GEN3_DOMAIN}/`,
    endpoint: "/user/user",
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
    }
  });
});

export type UserStatus = "authenticated" | "unauthenticated" | "rejected"
export interface Gen3UserState extends Gen3User {
  readonly status: DataStatus;
  readonly userStatus: UserStatus;
  readonly error?: string;

}

const initialState: Gen3UserState = {
  status: "uninitialized",
  userStatus: "unauthenticated",
  error: undefined,
};

const slice = createSlice({
  name: "fence/user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserState.fulfilled, (state, action) => {
        const response = action.payload;
        if (response.errors) {
          state = castDraft(initialState);
          state.status = "rejected";
          state.error = response.errors.filters;
        }

        state = { ...response.data, status: "fulfilled", userStatus:"authenticated" };
        return state;
      })
      .addCase(fetchUserState.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchUserState.rejected, (state) => {
        state.status = "rejected";
      });
  },
});

export const userReducer = slice.reducer;

export const selectUserData = (
  state: CoreState,
): CoreDataSelectorResponse<Gen3User> => {
  return {
    data: state.user,
    status: state.user.status,
    error: state.user.error,
  };
};

export const selectUser = (
  state: CoreState,
): Gen3UserState => state.user;

export const useUser = createUseCoreDataHook(
  fetchUserState,
  selectUserData,
);
