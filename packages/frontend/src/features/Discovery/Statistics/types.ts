
import { CellRenderFunctionProps } from '../TableRenderers/types';


export interface SummaryStatisticsConfig {
  name: string; // The name of the aggregation
  field: string; // Points to the field in the data
  type: 'sum' | 'count'; // The type of aggregation
  displayFunction?: string; // The display function to use
}

export interface StatisticsDataRequest {
  field: string; // JSON Path of field to aggregate
  type: 'sum' | 'count'; // The type of aggregation
}

export interface StatisticsDataResponse extends StatisticsDataRequest {
  value: number | string; // The value of the aggregation
}
export type SummaryStatistics = Record<string, StatisticsDataResponse>;

export type StatisticsDataRetrievalFunction = (items: ReadonlyArray<StatisticsDataRequest>) => Array<StatisticsDataResponse>;
