import { createAppApiForRTKQ } from '@gen3/core';

export const _APP_NAME = 'CohortSimilarity'; // This wil be the route name of the app
export const _APP_VERSION = '1.0.0';

export const {
  appApi: cohortSimilarityApi,
  appStore,
  appContext,
} = createAppApiForRTKQ('cohortSimilarity', _APP_NAME, _APP_VERSION);
