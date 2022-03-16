import { configureStore } from '@reduxjs/toolkit'
import { aggMetadataApi } from "../features/metadata/metadataSlice";


export const coreStore = configureStore({
    reducer: {
        [aggMetadataApi.reducerPath]: aggMetadataApi.reducer,
    },
})

// @ts-ignore
export type CoreDispatch = typeof coreStore.dispatch;
// @ts-ignore
export type CoreState = ReturnType<typeof coreStore.getState>
