import {
  convertFilterSetToGqlFilter,
  DispatchJobParams,
  FilterSet,
} from '@gen3/core';

interface DispatchJobActionParams {
  action: string;
  filters: FilterSet;
  index: string;
  dispatchJob: (arg: DispatchJobParams) => void;
}

export const submitJobAction = (
  params: Record<string, any>,
  done?: () => void,
  onError?: (error: Error) => void,
): Promise<void> => {
  try {
    const { action, filters, index, dispatchJob } =
      params as DispatchJobActionParams;

    dispatchJob({
      action: action,
      input: {
        filter: convertFilterSetToGqlFilter(filters),
        root_node: index,
      },
    });

    if (done) done();
    return Promise.resolve();
  } catch (error) {
    if (onError) onError(error as Error);
    return Promise.reject(error);
  }
};
