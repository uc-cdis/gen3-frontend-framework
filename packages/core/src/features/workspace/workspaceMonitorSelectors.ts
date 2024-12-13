import { CoreState } from '../../reducers';

export const selectIsMonitoring = (state: CoreState) =>
  state.workspaceMonitoring.isMonitoring;
