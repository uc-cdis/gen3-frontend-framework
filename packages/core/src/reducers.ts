import  { aggReducer, aggReducerPath} from './features/metadata/metadataSlice';
import {combineReducers} from '@reduxjs/toolkit';
import { loginProvidersReducer } from './features/fence/fenceSlice';
import { csrfTokenReducer } from './features/fence';

export const rootReducer = combineReducers( {
  [aggReducerPath]: aggReducer,
  fence: loginProvidersReducer,
  csrf: csrfTokenReducer,
});

export type CoreState = ReturnType<typeof rootReducer>;
