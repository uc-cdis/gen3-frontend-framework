import {
  convertFilterSetToGqlFilter,
  FilterSet,
  JSONObject,
  useSubmitSowerJobMutation,
} from '@gen3/core';

const verifyPFBRequest = (filters: FilterSet) => {
  return {
    message: 'ok',
    valid: true,
  };
};

export interface SubmitFilterResult {
  uid?: string;
  error?: string;
  isLoading: boolean;
}

export const useSubmitFilter = () => {
  const [submitJob, { isLoading }] = useSubmitSowerJobMutation();

  const submit = async (
    filterSet: FilterSet,
    index: string,
  ): Promise<SubmitFilterResult> => {
    try {
      const gqlFilter = convertFilterSetToGqlFilter(filterSet);
      const response = await submitJob({
        action: 'filter',
        input: {
          filter: gqlFilter as unknown as JSONObject,
          index,
        },
      }).unwrap();

      return {
        uid: response.uid,
        isLoading,
      };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Failed to submit filter',
        isLoading,
      };
    }
  };

  return {
    submit,
    isLoading,
  };
};
