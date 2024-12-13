import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MonitoringState {
  isEnabled: boolean;
  lastStatusCheck: number;
  lastPaymentCheck: number;
  isMonitoring: boolean;
}

const monitoringSlice = createSlice({
  name: 'workspaceMonitoring',
  initialState: {
    isEnabled: false,
    lastStatusCheck: 0,
    lastPaymentCheck: 0,
    isMonitoring: false,
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
    setIsMonitoring: (state, action: PayloadAction<boolean>) => {
      state.isMonitoring = action.payload;
    },
  },
});

export const {
  setMonitoringEnabled,
  updateLastStatusCheck,
  updateLastPaymentCheck,
  setIsMonitoring,
} = monitoringSlice.actions;
export const workspaceMonitoringReducer = monitoringSlice.reducer;

// Selector for monitoring state
