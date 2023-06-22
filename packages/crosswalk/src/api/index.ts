import { gen3Api } from '@gen3/core';
import { CrosswalkArray, CrosswalkInfo, CrosswalkParams } from '../Crosswalk/types';

export const crosswalkAPI = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getCrosswalkData: builder.query<CrosswalkArray, CrosswalkParams>({
      query: (params) => ({ url: `metadata?${params.ids}` }),
      transformResponse: (response: Record<string, any>, _meta, params) => {
        return {
          mapping: Object.values(response).map((x): CrosswalkInfo => {
            return {
              from: x.ids[params.fields.from],
              to: x.ids[params.fields.to],
            };
          }),
        };
      },
    }),
  }),
});

export const {
  useGetCrosswalkDataQuery
} = crosswalkAPI;
