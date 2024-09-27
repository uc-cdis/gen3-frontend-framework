import { createGen3App } from '@gen3/core';
import CohortDiscoveryApp from './CohortDiversityApp';

const _APP_NAME = 'CohortDiversity'; // This wil be the route name of the app

export const registerCohortDiversityApp = () =>
  createGen3App({
    App: CohortDiscoveryApp,
    name: _APP_NAME,
    version: 'v1.0.0',
    requiredEntityTypes: [],
  });

export const CohortDiversityAppName = _APP_NAME;
