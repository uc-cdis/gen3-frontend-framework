import { createGen3App } from '@gen3/core';
import CohortDiscovery from './CohortDiscovery';

const _APP_NAME = 'CohortDiscovery';

export const registerCohortDiscoveryApp = () =>
  createGen3App({
    App: CohortDiscovery,
    name: _APP_NAME,
    version: '0.1',
    requiredEntityTypes: [],
  });

export const CohortDiscoveryAppName = _APP_NAME;
