import type { ServiceDescription } from './types';

export const GEN3_SERVICES: Array<ServiceDescription> = [
  {
    id: 'fence',
    name: 'Fence',
    description: 'AuthZ / token management service',
  },
  {
    id: 'indexd',
    name: 'Indexd',
    description: 'Data object indexing & resolution',
  },
  {
    id: 'sheepdog',
    name: 'Sheepdog',
    description: 'Data submission & validation',
  },
  {
    id: 'peregrine',
    name: 'Peregrine',
    description: 'GraphQL query service',
  },
  {
    id: 'guppy',
    name: 'Guppy',
    description: 'Elasticsearch-backed exploration',
  },
  {
    id: 'arborist',
    name: 'Arborist',
    description: 'Access policy engine',
  },
  {
    id: 'metadata-service',
    name: 'Metadata Service (MDS)',
    description: 'Aggregate metadata for discovery',
  },
  {
    id: 'hatchery',
    name: 'Hatchery',
    description: 'Workspace & notebook launcher',
  },
  {
    id: 'sower',
    name: 'Sower',
    description: 'Job dispatch for ETL & workflows',
  },
  {
    id: 'manifestservice',
    name: 'Manifest Service',
    description: 'Cohort export & file manifests',
  },
];
