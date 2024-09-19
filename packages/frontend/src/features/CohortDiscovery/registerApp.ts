import { createGen3AppWithOwnStore } from '@gen3/core';
import CohortDiscovery from './CohortDiscovery';
import { AppContext, AppStore, id } from './appApi';

const _APP_NAME = 'CohortDiscovery'; // This wil be the route name of the app

export const registerCohortDiscoveryApp = () =>
  createGen3AppWithOwnStore({
    App: CohortDiscovery,
    id: id,
    name: _APP_NAME,
    version: 'v1.0.0',
    requiredEntityTypes: [],
    store: AppStore,
    context: AppContext,
  });

export const CohortDiscoveryAppName = _APP_NAME;
