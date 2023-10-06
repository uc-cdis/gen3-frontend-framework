// set of interfaces which follows the current explorer configuration

export interface TabConfig {
  readonly title: string;
  readonly fields: ReadonlyArray<string>;
}

export interface TabsConfig {
  readonly tabs: ReadonlyArray<TabConfig>;
}

export interface SummaryChart {
  readonly title: string;
  readonly chartType: string;
}

export interface SummaryTableColumn {
  field: string;
  title: string;
  accessorPath?: string; // JSONPath to column data
  type?: 'string' | 'number' | 'date' | 'array';
  cellRenderFunction?: string,
  width?: number; // override auto width of column
}

export interface SummaryTable {
  readonly enabled: boolean;
  readonly fields: ReadonlyArray<string>;
  readonly columns?: Record<string, SummaryTableColumn>
}

export interface FieldToName {
  readonly field: string;
  readonly name: string;
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
