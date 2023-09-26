

export interface AggregationRenderConfig {
  name: string; // The name of the aggregation
  field: string; // Points to the field in the data
  type: 'sum' | 'count'; // The type of aggregation
  displayFunction: string; // The display function to use
  dataHook: string; // The data hook to use for the aggregation
}
