import { CoreState } from '../../reducers';

export const selectSowerJobIds = (state: CoreState): Array<string> =>
  state.sowerJobsList.jobIds;
