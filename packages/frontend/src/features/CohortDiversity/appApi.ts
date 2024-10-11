import { createAppStore } from '@gen3/core';
import { diversityMiddleware, diversityReducer } from './diversityApi';

const _APP_NAME = 'CohortDiversity';

export const {
  id,
  AppStore,
  AppContext,
  useAppSelector,
  useAppDispatch,
  useAppStore,
} = createAppStore({
  reducers: diversityReducer,
  name: _APP_NAME,
  version: '0.0.1',
  middleware: diversityMiddleware,
});

export type AppState = ReturnType<typeof diversityReducer>;
