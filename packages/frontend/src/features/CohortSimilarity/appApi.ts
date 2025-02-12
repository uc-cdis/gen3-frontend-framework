import { createAppApiForRTKQ } from '@gen3/core';

export const {
  appApi: cohortSimilarityApi,
  appStore,
  appContext,
} = createAppApiForRTKQ('cohortSimilarity');
