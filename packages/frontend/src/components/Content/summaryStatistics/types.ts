export interface StatisticsElement {
  field: string;
  label?: string;
  color?: string;
  icon?: string;
  tooltip?: string;
  queryValues?: boolean;
  type: 'chart' | 'stats' | 'both';
  unit?: string;
}

export interface SummaryStatisticConfiguration {
  title: string;
  subtitle?: string;
  elements: Record<string, Array<StatisticsElement>>;
}
