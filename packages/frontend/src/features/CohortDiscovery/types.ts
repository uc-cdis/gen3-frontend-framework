import { Gen3AppConfigData } from '../../lib/content/types';
import { DataTypeConfig, TabConfig } from '../CohortBuilder/types';

export interface CohortDiscoveryGroup {
  readonly dataConfig: DataTypeConfig; // database config
  readonly tabTitle: string; // title of the tab
  readonly tabs: ReadonlyArray<TabConfig>; // filters for the fields
}

export interface CohortDiscoveryConfig extends Gen3AppConfigData {
  dataIndexes: Array<CohortDiscoveryGroup>;
}

export type SupportedFacetTypes = 'enum' | 'range';
