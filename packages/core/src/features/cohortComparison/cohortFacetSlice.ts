import { type GQLFilter } from '../filters';
import { graphQLAPI } from '../graphQL';
import { AggregationsData } from '../../types';
import { GEN3_ANALYSIS_API } from '../../constants';

interface CohortFacetsRequest {
  facetFields: string[];
  continuousFacets: string[];
  continuousFacetsInterval?: Record<string, number>;
  primaryCohort: GQLFilter;
  comparisonCohort: GQLFilter;
  index: string;
}

const DAYS_IN_DECADE = 3652; // Note: an approximation

export const cohortFacetSlice = graphQLAPI.injectEndpoints({
  endpoints: (builder) => ({
    cohortFacets: builder.query<AggregationsData, CohortFacetsRequest>({
      query: ({
        index,
        facetFields,
        continuousFacets,
        primaryCohort,
        comparisonCohort,
        continuousFacetsInterval = undefined,
      }) => ({
        url: `${GEN3_ANALYSIS_API}/compare/facets`,
        method: 'POST',
        body: {
          doc_type: index,
          cohort1: primaryCohort,
          cohort2: comparisonCohort,
          facets: facetFields,
          interval:
            continuousFacetsInterval ??
            continuousFacets.reduce((acc: Record<string, number>, x) => {
              acc[x] = DAYS_IN_DECADE;
              return acc;
            }, {}),
        },
      }),
      transformResponse: (response: any) => {
        const facets1 = response?.cohort1?.facets;
        const facets2 = response?.cohort2?.facets;
        return {
          aggregations: [facets1, facets2],
        };
      },
    }),
  }),
});

export const { useCohortFacetsQuery } = cohortFacetSlice;
