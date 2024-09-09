import { JSONValue } from '@gen3/core';

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
  value: JSONValue; // The value of the aggregation
}

//TODO type this instead of using any
export interface SummaryStatisticsDisplayData extends SummaryStatisticsConfig {
  value: any; // The value of the aggregation
}

export type SummaryStatistics = Array<SummaryStatisticsDisplayData>;

export type StatisticsDataRetrievalFunction = (
  items: ReadonlyArray<StatisticsDataRequest>,
) => Array<StatisticsDataResponse>;
