import {
  FilterSet,
  DispatchJobParams,
  convertFilterSetToGqlFilter,
  JSONObject,
} from '@gen3/core';

interface DispatchJobActionParams {
  action: string;
  filters: FilterSet;
  index: string;
  dispatchJob: (arg: DispatchJobParams) => void;
}

export const submitJobAction = (params: Record<string, any>): void => {
  const { action, filters, index, dispatchJob } =
    params as DispatchJobActionParams;

  dispatchJob({
    action: action,
    input: {
      filters: convertFilterSetToGqlFilter(filters),
      root_node: index,
    },
  });
};
