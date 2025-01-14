import { Gen3AppConfigData } from '../../lib/content/types';
import { DataTypeConfig, TabConfig } from '../CohortBuilder/types';

interface EmptySelection {
  image: string;
  imageAlt: string;
  title?: string;
  subHead?: string;
}

export interface CohortDiscoveryGroup {
  readonly dataConfig: DataTypeConfig; // database config
  readonly tabTitle: string; // title of the tab
  readonly tabs: ReadonlyArray<TabConfig>; // filters for the fields
  readonly emptySelection: EmptySelection; // What to show when no filters are selected
}

export interface CohortDiscoveryConfig extends Gen3AppConfigData {
  dataIndexes: Array<CohortDiscoveryGroup>;
  emptySelection: EmptySelection;
}

export type SupportedFacetTypes = 'enum';
