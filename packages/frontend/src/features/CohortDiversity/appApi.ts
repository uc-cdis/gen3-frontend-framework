import { createAppApiForRTKQ } from '@gen3/core';

export const {
  appApi: diversityApi,
  appStore,
  appContext,
} = createAppApiForRTKQ('cohortDiversity');
