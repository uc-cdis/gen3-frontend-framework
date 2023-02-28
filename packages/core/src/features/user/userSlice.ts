import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchFence, Gen3FenceResponse } from "../fence";
import { CoreDispatch } from "../../store";
import { CoreState } from "../../reducers";
import { GEN3_DOMAIN } from "../../constants";
import {
  CoreDataSelectorResponse,
  createUseCoreDataHook,
  DataStatus,
} from "../../dataAccess";
import { useCoreDispatch, useCoreSelector } from "../../hooks";
import { useEffect } from "react";

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
>("fence/user", async (_1 ) => {
  return await fetchFence({
    hostname: `${GEN3_DOMAIN}`,
    endpoint: "/user/user",
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
  });
});

export type UserStatus = "authenticated" | "unauthenticated" | "rejected";

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
      .addCase(fetchUserState.fulfilled, (_, action) => {
        const response = action.payload;
        if (response.errors) {
          return {
            status: "rejected",
            userStatus: "unauthenticated",
            error: response.errors.filters,
          };
        }

        return {
          ...response.data,
          status: "fulfilled",
          userStatus: "authenticated",
        };
      })
      .addCase(fetchUserState.pending, () => {
        return { status: "pending", userStatus: "unauthenticated" };
      })
      .addCase(fetchUserState.rejected, () => {
        return { status: "rejected", userStatus: "unauthenticated" };
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

export const selectUser = (state: CoreState): Gen3UserState => state.user;

export const useUser = createUseCoreDataHook(fetchUserState, selectUserData);

export const useGetUser = () => {
  const coreDispatch = useCoreDispatch();
  const { data, status, error } = useCoreSelector(selectUserData);


  useEffect(() => {
    if (status === "uninitialized") {
      // createDispatchHook types forces the input to AnyAction, which is
      // not compatible with thunk actions. hence, the `as any` cast. ;(
      coreDispatch(fetchUserState());
    }
  }, [status, coreDispatch]);

  return {
    data,
    error,
    isUninitialized: status === "uninitialized",
    isFetching: status === "pending",
    isSuccess: status === "fulfilled",
    isError: status === "rejected",
  };
};
