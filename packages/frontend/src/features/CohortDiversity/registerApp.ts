import { createGen3AppWithOwnStore, getGen3AppId } from '@gen3/core';
import CohortDiscoveryApp from './CohortDiversityApp';
import { appStore, appContext } from './appApi';

const _APP_NAME = 'CohortDiversity'; // This wil be the route name of the app
const _APP_VERSION = '1.0.0';

console.log('registerApp', _APP_NAME, _APP_VERSION);

const AppId = getGen3AppId(_APP_NAME, _APP_VERSION);
export const registerCohortDiversityApp = () =>
  createGen3AppWithOwnStore({
    App: CohortDiscoveryApp,
    name: _APP_NAME,
    version: 'v1.0.0',
    id: AppId,
    requiredEntityTypes: [],
    store: appStore,
    context: appContext,
  });

export const CohortDiversityAppName = _APP_NAME;
