import { configureStore } from '@reduxjs/toolkit'
import { aggMetadataApi } from "../features/metadata/query";

export const coreStore = configureStore({
    reducer: {
        [aggMetadataApi.reducerPath]: aggMetadataApi.reducer,
    },
})

export type CoreDispatch = typeof coreStore.dispatch;
export type CoreState = ReturnType<typeof coreStore.getState>

