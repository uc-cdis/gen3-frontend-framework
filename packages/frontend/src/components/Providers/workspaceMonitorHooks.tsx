import {
  useCoreDispatch,
  useCoreSelector,
  selectIsMonitoring,
  setIsMonitoring,
} from '@gen3/core';

export const useWorkspaceMonitoringControl = () => {
  const dispatch = useCoreDispatch();
  const isMonitoring = useCoreSelector(selectIsMonitoring);

  const startMonitoring = () => {
    dispatch(setIsMonitoring(true));
  };

  const stopMonitoring = () => {
    dispatch(setIsMonitoring(false));
  };

  return {
    isMonitoring,
    startMonitoring,
    stopMonitoring,
  };
};
