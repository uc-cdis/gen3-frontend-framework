import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MonitoringState {
  isEnabled: boolean;
  lastStatusCheck: number;
  lastPaymentCheck: number;
}

const monitoringSlice = createSlice({
  name: 'workspaceMonitoring',
  initialState: {
    isEnabled: false,
    lastStatusCheck: 0,
    lastPaymentCheck: 0,
  } as MonitoringState,
  reducers: {
    setMonitoringEnabled: (state, action: PayloadAction<boolean>) => {
      state.isEnabled = action.payload;
    },
    updateLastStatusCheck: (state) => {
      state.lastStatusCheck = Date.now();
    },
    updateLastPaymentCheck: (state) => {
      state.lastPaymentCheck = Date.now();
    },
  },
});

export const {
  setMonitoringEnabled,
  updateLastStatusCheck,
  updateLastPaymentCheck,
} = monitoringSlice.actions;
export const workspaceMonitoringReducer = monitoringSlice.reducer;
