import  { mdsReducer, mdsReducerPath} from "./features/metadata/metadataSlice";
import {combineReducers} from "@reduxjs/toolkit";
import { loginProvidersReducer, csrfReducerPath, csrfReducer } from "./features/fence";

export const rootReducer = combineReducers( {
  [mdsReducerPath]: mdsReducer,
  [csrfReducerPath]: csrfReducer,
  fence: loginProvidersReducer,
});

export type CoreState = ReturnType<typeof rootReducer>;
