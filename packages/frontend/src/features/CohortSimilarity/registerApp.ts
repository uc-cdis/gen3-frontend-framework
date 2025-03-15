import { createGen3AppWithOwnStore, getGen3AppId } from '@gen3/core';
import CohortSimilarityApp from './CohortSimilarityApp';
import { _APP_NAME, _APP_VERSION, appContext, appStore } from './appApi';

const AppId = getGen3AppId(_APP_NAME, _APP_VERSION);
export const registerCohortSimilarityApp = () =>
  createGen3AppWithOwnStore({
    App: CohortSimilarityApp,
    name: _APP_NAME,
    version: 'v1.0.0',
    id: AppId,
    requiredEntityTypes: [],
    store: appStore,
    context: appContext,
  });

export const CohortSimilarityAppName = _APP_NAME;
