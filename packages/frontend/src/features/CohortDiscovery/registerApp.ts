import { createGen3AppWithOwnStore, getGen3AppId } from '@gen3/core';
import CohortDiscovery from './CohortDiscovery';
import { AppContext, AppStore } from './appApi';

const _APP_NAME = 'CohortDiscovery'; // This wil be the route name of the app
const _APP_VERSION = '1.0.0';

const AppId = getGen3AppId(_APP_NAME, _APP_VERSION);
export const registerCohortDiscoveryApp = () =>
  createGen3AppWithOwnStore({
    App: CohortDiscovery,
    id: AppId,
    name: _APP_NAME,
    version: 'v1.0.0',
    requiredEntityTypes: [],
    store: AppStore,
    context: AppContext,
  });

export const CohortDiscoveryAppName = _APP_NAME;
