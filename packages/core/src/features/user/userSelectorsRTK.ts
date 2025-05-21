import { Gen3User, LoginStatus } from './types';
import { createSelector } from '@reduxjs/toolkit';
import { QueryStatus } from '@reduxjs/toolkit/query';
import { CoreState } from '../../reducers';
import { selectUserDetailsFromState, userAuthApi } from './userSliceRTK';

const EMPTY_USER: Gen3User = {
  username: undefined,
};

export const selectUserDetails = createSelector(
  selectUserDetailsFromState,
  (userDetails) => userDetails?.data?.data ?? EMPTY_USER,
);
export const selectUserAuthStatus = createSelector(
  selectUserDetailsFromState,
  (userLoginState) =>
    userLoginState.status === QueryStatus.pending
      ? ('pending' as LoginStatus)
      : userLoginState.status === QueryStatus.uninitialized
        ? ('not present' as LoginStatus)
        : (userLoginState?.data?.loginStatus ??
          ('unauthenticated' as LoginStatus)),
);
export const selectCSRFTokenData = userAuthApi.endpoints.getCSRF.select();
const passThroughTheState = (state: CoreState) => state.userAuthApi;
export const selectCSRFToken = createSelector(
  [selectCSRFTokenData, passThroughTheState],
  (state) => state?.data?.csrfToken,
);
export const selectHeadersWithCSRFToken = createSelector(
  [selectCSRFToken, passThroughTheState],
  (csrfToken) => ({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
  }),
);
