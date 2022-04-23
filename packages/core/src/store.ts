import {configureStore,} from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { rootReducer } from "./reducers";


export const coreStore = configureStore({
    reducer: rootReducer,
})

setupListeners(coreStore.dispatch)

export type CoreDispatch = typeof coreStore.dispatch;
