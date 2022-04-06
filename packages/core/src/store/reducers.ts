import  { aggReducer, aggReducerPath} from "../features/metadata/metadataSlice";
import {combineReducers} from "@reduxjs/toolkit";

export const rootReducer = combineReducers( {
    [aggReducerPath]: aggReducer
});
export type CoreState = ReturnType<typeof rootReducer>;
