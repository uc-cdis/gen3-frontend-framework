import { TabsConfig } from '../../../features/CohortBuilder/types';
import { Accessibility, FacetDefinition, FacetType } from '@gen3/core';
import { FacetDataHooks } from '../index';

export interface TabbablePanelProps<T extends FacetType = FacetType> {
  index: string;
  filters: TabsConfig;
  tabTitle: string;
  facetDefinitions: Record<string, FacetDefinition>;
  facetDataHooks: Record<T, FacetDataHooks>;
  onAccessChange?: (value: Accessibility) => void;
  accessLevel?: Accessibility;
  showAccessLevel?: boolean;
}
