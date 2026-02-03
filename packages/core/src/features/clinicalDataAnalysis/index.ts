import {
  type ClinicalContinuousStatsData,
  useGetContinuousDataStatsQuery,
} from './clinicalContinuousStatsSlice';

import { buildRangeQuery } from './utils';

export {
  useGetContinuousDataStatsQuery,
  buildRangeQuery,
  ClinicalContinuousStatsData,
};
