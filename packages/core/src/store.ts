import {configureStore,} from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { rootReducer } from "./reducers";
import {mdsReducerMiddleware } from "./features/metadata/metadataSlice";
import { csrfReducerMiddleware } from "./features/fence";

export const coreStore = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(mdsReducerMiddleware, csrfReducerMiddleware),

});

setupListeners(coreStore.dispatch);

export type CoreDispatch = typeof coreStore.dispatch;
