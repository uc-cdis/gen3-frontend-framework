import { createGen3AppWithOwnStore, getGen3AppId } from '@gen3/core';
import CohortDiscovery from './CohortDiscovery';
import { _APP_NAME, _APP_VERSION, AppContext, AppStore } from './appApi';

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
