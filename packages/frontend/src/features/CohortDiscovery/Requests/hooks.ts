import { IndexResourceField } from '../types';
import {
  Accessibility,
  IndexedFilterSet,
  useLazyGetAggsNoFilterSelfQuery,
} from '@gen3/core';

interface QueryAllIndexedState {
  data: any[];
  isLoading: boolean;
  error?: Error;
}

export class QueryAllIndexedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QueryAllIndexedError';
  }
}

// To get the return type of the whole hook
type LazyQueryGQLAggsHookResult = ReturnType<
  typeof useLazyGetAggsNoFilterSelfQuery
>;
// To get just the type of the trigger function (first element of tuple)
export type QueryGQLAggsrFunctionType = LazyQueryGQLAggsHookResult[0];

/**
 * Queries all resources based on the provided filters and resource fields, executing an aggregation query for each resource type.
 *
 * @async
 * @function
 * @param {IndexedFilterSet} filters - A set of filters indexed by resource types, used to refine the query results for each resource type.
 * @param {IndexResourceField} resourceFields - A mapping of resource types to their respective field configurations, including resource paths and field details.
 * @param {TriggerFunctionType} triggerAggsQuery - A function that triggers the aggregation query for a specific resource type and its associated fields.
 * @param {string[]} [excludeList=['', 'no data']] - An optional list of strings to exclude from the results, with default values set to an empty string and "no data".
 * @returns {Promise<string[]>} A promise that resolves to an array of resource paths for all queried and processed resources.
 * @throws {QueryAllIndexedError} Throws an error if the query operation fails or an unknown error occurs during execution.
 */
export const queryAllResources = async (
  filters: IndexedFilterSet,
  resourceFields: IndexResourceField,
  triggerAggsQuery: QueryGQLAggsrFunctionType,
  excludeList = ['', 'no data'],
) => {
  try {
    const promises = Object.entries(resourceFields).map(
      ([index, fieldConfig]) =>
        triggerAggsQuery({
          filters: filters[index],
          type: index,
          fields: [fieldConfig.resourceField],
          accessibility: Accessibility.ALL,
        })
          .unwrap()
          .then((result) => ({ index, result })),
    );

    const resources = await Promise.all(promises);
    const resultsByIndex = resources.reduce(
      (acc: Record<string, string[]>, resource) => {
        const filteredResults = Object.values(resource.result)
          .map((hist) => hist.map((h) => h.key))
          .flat()
          .filter(
            (x): x is string =>
              typeof x === 'string' && !excludeList.includes(x),
          );
        const uniqueResults = new Set(filteredResults);
        const stringResults = Array.from(uniqueResults) as string[];
        acc[resource.index] = stringResults;
        return acc;
      },
      {},
    );

    return Object.entries(resultsByIndex).reduce(
      (acc: string[], [index, results]) => {
        const resourcePath = resourceFields[index].resourcePath;
        if (resourcePath) {
          acc.push(...results.map((x) => `${resourcePath}/${x}`));
        } else {
          acc.push(...results.map((x) => `/${x}`));
        }
        return acc;
      },
      [],
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new QueryAllIndexedError(error.message);
    } else {
      throw new QueryAllIndexedError('Unknown error');
    }
  }
};
