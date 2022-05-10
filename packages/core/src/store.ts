import {configureStore,} from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { rootReducer } from "./reducers";
import  {aggReducerMiddleware } from "./features/metadata/metadataSlice";

export const coreStore = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(aggReducerMiddleware),
})

setupListeners(coreStore.dispatch)

export type CoreDispatch = typeof coreStore.dispatch;
