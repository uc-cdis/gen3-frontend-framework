import uniq from 'lodash/uniq';
import sum from 'lodash/sum';
import { JSONPath } from 'jsonpath-plus';
import { JSONObject } from '@gen3/core';
import { SummaryStatisticsConfig } from '../../Statistics';
import { SummaryStatistics } from '../../Statistics/types';

/**
 * Process a summary statistic using the provided data and summary config
 * @param {JSONObject }data
 * @param {SummaryStatisticsConfig} summary config from Discovery Config
 */
export const processSummary = (
  data: JSONObject[],
  summary: SummaryStatisticsConfig,
): string => {
  const { field, type } = summary;
  let fields = JSONPath({ path: `$..${field}`, json: data });
  // Replace any undefined fields with value 0
  fields = fields.map((item: string | number) =>
    typeof item === 'undefined' ? 0 : item,
  );
  switch (type) {
    case 'sum': {
      // parse any string representation of an integer
      fields = fields.map((item: string | number) =>
        typeof item === 'string' ? parseInt(item, 10) || 0 : item,
      );
      return sum(fields).toLocaleString();
    }
    case 'count':
      return uniq(fields).length.toLocaleString();
    default:
      throw new Error(
        `Misconfiguration error: Unrecognized aggregation type ${type}. Check the 'aggregations' block of the Discovery page config.`,
      );
  }
};

export const processAllSummaries = (
  data: JSONObject[],
  summaries: SummaryStatisticsConfig[],
) => {
  if (!Array.isArray(data)) {
    throw new Error('Invalid input: data must be an array.');
  }
  if (!Array.isArray(summaries)) {
    throw new Error('Invalid input: summaries must be an array.');
  }

  return summaries.reduce((acc, summary) => {
    return [
      ...acc,
      {
        ...summary,
        value: processSummary(data, summary),
      },
    ];
  }, [] as SummaryStatistics);
};
