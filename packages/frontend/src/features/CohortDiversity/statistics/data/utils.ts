import { AggregationsData, HistogramDataArray } from '@gen3/core';
import { JSONPath } from 'jsonpath-plus';
import { isArray } from 'lodash';

/**
 * Converts a deeply nested data structure of numbers into a structured aggregation data format.
 *
 * @param {Record<string, Record<string, Record<string, number>>>} data - The input data where the structure
 * consists of three levels of nested records:
 *   - The outermost level is keyed by source identifiers.
 *   - The middle level is keyed by aggregation identifiers.
 *   - The innermost level is keyed by histogram keys with corresponding numeric counts.
 *
 * @return {Record<string, AggregationsData>} - A newly structured data object where:
 *   - The outermost level is the same as the input.
 *   - Each aggregation identifier now maps to an array of histogram objects with key-count pairs.
 */
export const convertToAggregateData = (
  data: Record<string, Record<string, Record<string, number>>>,
): Record<string, AggregationsData> => {
  const result: Record<string, AggregationsData> = {};

  for (const [sourceKey, sourceValue] of Object.entries(data)) {
    const aggData: AggregationsData = {};

    for (const [aggKey, aggValue] of Object.entries(sourceValue)) {
      const histogramDataArray: HistogramDataArray = [];

      for (const [key, count] of Object.entries(aggValue)) {
        histogramDataArray.push({ key, count });
      }

      aggData[aggKey] = histogramDataArray;
    }

    result[sourceKey] = aggData;
  }

  return result;
};

/**
 * Converts histogram response data into percentages based on the total counts.
 *
 * @param {Record<string, any>} data - The input data containing histogram details and total counts.
 *
 * @returns {AggregationsData} The processed histogram data where counts are converted to percentages.
 */
export const processHistogramResponseAsPercentage = (
  data: Record<string, any>,
): AggregationsData => {
  const pathData = JSONPath({
    json: data,
    path: '$..histogram',
    resultType: 'all',
  });

  const totalData = JSONPath({
    json: data,
    path: '$.._totalCount',
    resultType: 'value',
  });

  const total = totalData[0];

  const results = pathData.reduce(
    (acc: AggregationsData, element: Record<string, any>) => {
      const key = element.pointer.split('/').slice(-2, -1)[0];

      if (isArray(element.value[0].key) && element.value[0].key.length == 2) {
        if (!(key in acc)) acc[key] = [];
        return {
          ...acc,
          [key]: [
            {
              key: `${element.value[0].key[0]}-${element.value[0].key[1]}`,
              count: (element.value[0].count / total) * 100,
            },
            ...acc[key],
          ],
        };
      }

      return {
        ...acc,
        [key]: element.value.map((x: { key: string; count: number }) => {
          return { key: x.key, count: (x.count / total) * 100 };
        }),
      };
    },
    {} as AggregationsData,
  );
  return results as AggregationsData;
};

/**
 * Takes an object of type AggregationsData and normalizes the
 * 'age_at_index' property by converting the age keys to a string format.
 *
 * This function checks if the 'age_at_index' key exists in the input object.
 * If it does, it transforms each age entry by appending ' Years' to the age
 * value and returns the updated object. If the 'age_at_index' key does not exist,
 * it returns the original data.
 *
 * @param {AggregationsData} data - The input data object containing the age aggregations.
 * @returns {AggregationsData} - The transformed data object with normalized age keys.
 */
export const normalizeAgeOfIndex = (data: AggregationsData) => {
  if (!('age_at_index' in data)) return data;

  const newKeys = data['age_at_index'].map((x) => {
    return { key: `${x.key} Years`, count: x.count };
  });

  return {
    ...data,
    age_at_index: newKeys,
  };
};

/**
 * Aligns the source data with the target structure by mapping items based on their keys and updating the counts.
 *
 * This function takes two sets of aggregation data, aligns them by their categories and individual keys,
 * and updates the counts from the source data. If a category or its items are missing in the source data,
 * a count of 0 is assigned to those items in the resulting aligned data structure.
 *
 * @param {AggregationsData} sourceData - The source aggregation data containing key-value pairs with the count.
 * @param {AggregationsData} targetStructure - The target aggregation structure used to align and structure the result.
 * @return {AggregationsData} The aligned data with updated counts from the source data, maintaining the target structure.
 */
export const alignData = (
  sourceData: AggregationsData,
  targetStructure: AggregationsData,
) => {
  const result: AggregationsData = {};
  const missing: string[] = [];

  for (const category in targetStructure) {
    if (category in sourceData) {
      result[category] = targetStructure[category].map((targetItem) => {
        const sourceItem = sourceData[category].find(
          (item) => item.key === targetItem.key,
        );
        return sourceItem
          ? { ...targetItem, count: sourceItem.count }
          : { ...targetItem, count: 0 };
      });
    } else {
      // store all key not found in sourceData
      missing.push(category);
    }
  }
  // TODO: report missing?
  // TODO: make this configurable
  return result;
};
