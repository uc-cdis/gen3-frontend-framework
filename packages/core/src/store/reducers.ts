import  { aggReducer, aggReducerPath} from "../features/metadata/metadataSlice";
import {combineReducers} from "@reduxjs/toolkit";
import { loginProvidersReducer } from "../features/fence/fenceSlice";

export const rootReducer = combineReducers( {
    [aggReducerPath]: aggReducer,
    fence: loginProvidersReducer,
});
export type CoreState = ReturnType<typeof rootReducer>;
