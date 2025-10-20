import { TabsConfig } from '../../../features/CohortBuilder/types';
import { Accessibility, FacetDefinition, FacetType } from '@gen3/core';
import { FacetDataHooks } from '../index';

export type SetFilterExpandedState = (expanded: boolean) => void;

export interface FacetPanelProps<T extends FacetType = FacetType> {
  filters: TabsConfig;
  tabTitle: string;
  facetDefinitions: Record<string, FacetDefinition>;
  facetDataHooks: Record<T, FacetDataHooks>;
  onAccessChange?: (value: Accessibility) => void;
  accessLevel?: Accessibility;
  showAccessLevel?: boolean;
}

export interface TabbablePanelProps<T extends FacetType = FacetType>
  extends FacetPanelProps<T> {
  allFiltersCollapsed: boolean;
  toggleAllFiltersExpanded: SetFilterExpandedState;
  clearAllFilters: () => void;
}
