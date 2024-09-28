import { JSONObject } from '@gen3/core';
import { SummaryChart } from '../../components/charts';
import { TitleAndDescription } from '../../types';

interface DiversityChart extends TitleAndDescription {
  type: string;
  parameters?: JSONObject;
}

interface DiversityData {
  dataset: string;
}

export interface CohortDiversityConfig {
  datasets: {
    ground: DiversityData;
    comparison: Array<DiversityData>;
  };
  fields: ReadonlyArray<string>;
  fieldsConfig?: Record<string, Partial<TitleAndDescription>>;
  charts: Record<string, SummaryChart>;
  diversityCharts: Record<string, DiversityChart>;
}
