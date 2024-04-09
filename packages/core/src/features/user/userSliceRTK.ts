import { createSelector } from '@reduxjs/toolkit';
import { coreCreateApi } from '../../api';
import { fetchFence, Gen3FenceResponse } from '../fence';
import { Gen3User, LoginStatus } from './types';
import { JSONObject } from '../../types';


export interface UserAuthResponse  {
  readonly data: Gen3User | JSONObject;
  readonly loginStatus: LoginStatus;
}

const userAuthApi = coreCreateApi({
  reducerPath: 'userAuthApi',
  refetchOnFocus: true,
  refetchOnMountOrArgChange: 1800,
  baseQuery: async ({ endpoint }) => {
    let results;

    try {
      results = await fetchFence({ endpoint});
    } catch (e) {
      /*
        Because an "error" response is valid for the auth requests we don't want to
        put the request in an error state, or it will attempt the request over and over again
      */
      return { data: {}, loginStatus: 'unauthenticated'};
    }

    return { data: results, loginStatus: 'unauthenticated'};
  },
  endpoints: (builder) => ({
    fetchUserDetails: builder.query<UserAuthResponse, void>({
      query: () => ({ endpoint: 'user/user' }),
      transformResponse(response: Gen3FenceResponse<Gen3User>) {
        return {
          data: response.data,
          // TODO: check if this is the correct status code
          loginStatus: response.status === 200 ? 'authenticated' : 'unauthenticated',
        };
      }
    }),
  }),
});

const EMPTY_USER: Gen3User = {
  username: undefined
};

export const {
  useFetchUserDetailsQuery,
  useLazyFetchUserDetailsQuery,
} = userAuthApi;
export const userAuthApiMiddleware = userAuthApi.middleware;
export const userAuthApiReducerPath = userAuthApi.reducerPath;
export const userAuthApiReducer = userAuthApi.reducer;

export const selectUsersDetails = userAuthApi.endpoints.fetchUserDetails.select();

export const selectUserDetails =  createSelector(
  selectUsersDetails,
  userDetails => userDetails?.data ?? EMPTY_USER
);

export const selectUserAuthStatus = createSelector(
  selectUsersDetails,
  userLoginState => userLoginState?.data?.loginStatus ?? 'unauthenticated' as LoginStatus
);
