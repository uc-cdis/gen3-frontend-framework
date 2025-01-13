import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { rootReducer } from './reducers';
import { gen3ServicesReducerMiddleware } from './features/gen3/gen3Api';
import { guppyAPISliceMiddleware } from './features/guppy/guppyApi';
import { userAuthApiMiddleware } from './features/user/userSliceRTK';
import {
  persistReducer,
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';

import storage from './storage-persist';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['cohorts', 'activeWorkspace'],
};

export const coreStore = configureStore({
  reducer: persistReducer(persistConfig, rootReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      gen3ServicesReducerMiddleware,
      guppyAPISliceMiddleware,
      userAuthApiMiddleware,
    ),
});

setupListeners(coreStore.dispatch);

export type CoreDispatch = typeof coreStore.dispatch;
