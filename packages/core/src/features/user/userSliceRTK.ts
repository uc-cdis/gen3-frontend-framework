import { coreCreateApi } from '../../api';
import { fetchFence, Gen3FenceResponse } from '../fence';

const userAuthApi = coreCreateApi({
  reducerPath: "userAuthApi",
  refetchOnFocus: true,
  refetchOnMountOrArgChange: 1800,
  baseQuery: async ({ endpoint }) => {
    let results;

    try {
      results = await fetchFence({ endpoint});
    } catch (e) {
      /*
        Because an "error" response is valid for the auth requests we don't want to
        put the request in an error state or it will attempt the request over and over again
      */
      return { data: {} };
    }

    return { data: results };
  },
  endpoints: (builder) => ({
    fetchUserDetails: builder.query<Gen3FenceResponse<JSON>, void>({
      query: () => ({ endpoint: "user/user" }),
    }),
  }),
});

export const {
  useFetchUserDetailsQuery,
  useLazyFetchUserDetailsQuery,
  useGetCSRFQuery,
} = userAuthApi;
export const userAuthApiMiddleware = userAuthApi.middleware;
export const userAuthApiReducerPath = userAuthApi.reducerPath;
export const userAuthApiReducer = userAuthApi.reducer;
