import { GEN3_API } from '@gen3/core';
import { DiscoveryCohort } from './types';

export const GEN3_COHORT_DISCOVERY_API =
  process.env.GEN3_COHORT_DISCOVERY_API ||
  `${GEN3_API}/api/auth/analysis/cohortDiscovery`;

export const UninitializeCohort: DiscoveryCohort = {
  id: 'uninitialized',
  name: 'uninitialized',
  filters: {},
  modified: false,
  modifiedDatetime: 'uninitialized',
  createdDatetime: 'uninitialized',
  requestedAccess: false,
  requestId: 'uninitialized',
  saved: false,
};
