import { FacetDefinition } from '@gen3/core';
import { Gen3AppConfigData } from '../../lib/content/types';
import {
  CohortPanelConfig,
  DataTypeConfigWithManifest,
  TabsConfig,
} from '../CohortBuilder/types';
import { SummaryChart } from '../../components/charts';
import { SummaryTable } from '../CohortBuilder/ExplorerTable/types';

export interface CohortDiscoveryGroup {
  readonly guppyConfig: DataTypeConfigWithManifest; // guppy config
  readonly tabTitle: string; // title of the tab
  readonly filters?: TabsConfig; // filters for the fields
}

export interface CohortDiscoveryConfig extends Gen3AppConfigData {
  dataIndexes: Array<CohortDiscoveryGroup>;
}
