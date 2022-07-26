import  { mdsReducer, mdsReducerPath} from './features/metadata/metadataSlice';
import {combineReducers} from '@reduxjs/toolkit';
import { loginProvidersReducer } from './features/fence';
import { csrfTokenReducer } from './features/fence';

export const rootReducer = combineReducers( {
  [mdsReducerPath]: mdsReducer,
  fence: loginProvidersReducer,
  csrf: csrfTokenReducer,
});

export type CoreState = ReturnType<typeof rootReducer>;
