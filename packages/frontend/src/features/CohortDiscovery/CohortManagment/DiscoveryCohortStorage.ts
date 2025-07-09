import { CohortStorage } from '../../../types/CohortStorage';
import { Cohort, CohortId } from '../types';

const DATABASE_NAME = 'Gen3CohortDiscovery';
const STORE_NAME = 'cohorts';
const DB_SCHEMA_VERSION = 1;

// Export a singleton instance
export const cohortStorage = new CohortStorage<Cohort, CohortId>({
  databaseName: DATABASE_NAME,
  storeName: STORE_NAME,
  schemaVersion: DB_SCHEMA_VERSION,
});
