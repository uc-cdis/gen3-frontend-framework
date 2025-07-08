import { TabsConfig } from '../../../features/CohortBuilder/types';
import { Accessibility } from '@gen3/core';
import { FacetDataHooks } from '../index';
import { FacetDefinition, FacetType } from '../types';

export interface TabbablePanelProps {
  index: string;
  filters: TabsConfig;
  tabTitle: string;
  facetDefinitions: Record<string, FacetDefinition>;
  facetDataHooks: Record<FacetType, FacetDataHooks>;
  onAccessChange?: (value: Accessibility) => void;
  accessLevel?: Accessibility;
  showAccessLevel?: boolean;
}
