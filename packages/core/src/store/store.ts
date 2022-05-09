import { configureStore } from '@reduxjs/toolkit';
import { aggMetadataApi } from '../features/metadata/metadataSlice';

export const coreStore = configureStore({
  reducer: {
    aggMDS: aggMetadataApi.reducer,
  },
});

export type CoreDispatch = typeof coreStore.dispatch;
export type CoreState = ReturnType<typeof coreStore.getState>
