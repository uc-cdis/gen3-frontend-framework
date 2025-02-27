import { TabsConfig } from '../types';
import { FacetDefinition, FacetType } from '@gen3/core';
import { FacetDataHooks } from '../../../components/facets';

export interface TabbablePanelProps {
  index: string;
  filters: TabsConfig;
  tabTitle: string;
  facetDefinitions: Record<string, FacetDefinition>;
  facetDataHooks: Record<FacetType, FacetDataHooks>;
}
