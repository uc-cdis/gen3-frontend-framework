import { createGen3AppWithOwnStore, getGen3AppId } from '@gen3/core';
import CohortDistanceApp from './CohortDistanceApp';
import { appStore, appContext } from './appApi';

const _APP_NAME = 'CohortDistance'; // This wil be the route name of the app
const _APP_VERSION = '1.0.0';

const AppId = getGen3AppId(_APP_NAME, _APP_VERSION);
export const registerCohortDistanceApp = () =>
  createGen3AppWithOwnStore({
    App: CohortDistanceApp,
    name: _APP_NAME,
    version: 'v1.0.0',
    id: AppId,
    requiredEntityTypes: [],
    store: appStore,
    context: appContext,
  });

export const CohortDistanceAppName = _APP_NAME;
