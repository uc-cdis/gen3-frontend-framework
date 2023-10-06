import { type CoreState } from '../../reducers';

export const selectAggDataForIndex = (
  state: CoreState,
  index: string,
  field: string
) => {
  const data = state.graphqlAPI.aggs[index]?.[field]?.histogram;
  return data ?? {};
};
