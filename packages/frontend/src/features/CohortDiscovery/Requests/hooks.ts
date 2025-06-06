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

// To get the return type of the whole hook
type LazyQueryHookResult = ReturnType<typeof useLazyGetAggsNoFilterSelfQuery>;
// To get just the type of the trigger function (first element of tuple)
type TriggerFunctionType = LazyQueryHookResult[0];

export const queryAllResources = async (
  filters: IndexedFilterSet,
  resourceFields: IndexResourceField,
  triggerAggsQuery: TriggerFunctionType,
  excludeList = ['', 'no data'],
) => {
  try {
    const promises = Object.entries(resourceFields).map(([index, field]) =>
      triggerAggsQuery({
        filters: filters[index],
        type: index,
        fields: [field],
        accessibility: Accessibility.ALL,
      }).unwrap(),
    );
    const resources = await Promise.all(promises);
    const results = resources
      .map((resource) => {
        return Object.values(resource)
          .map((hist) =>
            hist
              .map((h) => h.key)
              .filter((k) => typeof k === 'string' && !excludeList.includes(k)),
          )
          .flat();
      })
      .flat();
    const uniqueResults = new Set(results);
    return Array.from(uniqueResults);
  } catch (error) {
    console.error(error);
    return [];
  }
};
