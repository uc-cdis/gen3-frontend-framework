import { graphQLAPI } from '../graphQL/graphQLSlice';
import { GEN3_ANALYSIS_API } from '../../constants';

const graphQLQuery = `
    query pValue($data: [[Int]]!) {
      analysis {
        pvalue(data: $data)
      }
    }
  `;

interface PValueResponse {
  data?: {
    analysis: {
      pvalue: number;
    };
  };
}

const pValueSlice = graphQLAPI.injectEndpoints({
  endpoints: (builder) => ({
    pValue: builder.query<number | undefined, number[][]>({
      query: (data) => ({
        url: `${GEN3_ANALYSIS_API}/pvalue`,
        method: 'POST',
        body: {
          query: graphQLQuery,
          variables: data,
        },
      }),
      transformResponse: (response: PValueResponse) =>
        response?.data?.analysis.pvalue,
    }),
  }),
});

export const { usePValueQuery } = pValueSlice;
