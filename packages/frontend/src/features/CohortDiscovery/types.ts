import { FacetDefinition } from '@gen3/core';
import { Gen3AppConfigData } from '../../lib/content/types';

export interface CohortDiscoveryCategories {
  index: string;
  category: string;
  rootPath?: string;
  facets: Array<FacetDefinition>;
}

export interface CohortDiscoveryConfig extends Gen3AppConfigData {
  categories: Array<CohortDiscoveryCategories>;
}
