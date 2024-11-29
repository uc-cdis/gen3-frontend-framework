import { CoreState } from '../../reducers';

export const selectSowerJobIds = (state: CoreState): Set<string> =>
  state.sowerJobsList.jobIds;
