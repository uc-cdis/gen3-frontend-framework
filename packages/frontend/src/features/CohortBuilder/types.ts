
// set of interfaces which follows the current explorer configuration

import { SummaryChart } from "../../components/charts/types";
import { SummaryTable } from "./ExplorerTable/types";
import { FieldToName } from "../../components/facets/types";

export interface TabConfig {
    readonly title: string;
    readonly fields: ReadonlyArray<string>;
}

export interface TabsConfig {
    readonly tabs: ReadonlyArray<TabConfig>;
}

export interface DataTypeConfig {
    readonly dataType: string;
    readonly nodeCountTitle: string;
    readonly fieldMapping: ReadonlyArray<FieldToName>;
}

export interface CohortPanelConfig {
    readonly guppyConfig: DataTypeConfig;
    readonly tabTitle: string;
    readonly charts?: Record<string, SummaryChart>;
    readonly table?: SummaryTable;
    readonly filters?: TabsConfig;
}

export interface CohortBuilderConfiguration {
    readonly explorerConfig: ReadonlyArray<CohortPanelConfig>;
}

// to do add buttons, options,  menus, etc

export interface CohortConfig {
    tabs: TabConfig[];
}
