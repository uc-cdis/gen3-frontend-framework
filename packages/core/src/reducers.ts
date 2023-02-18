import  { mdsReducer, mdsReducerPath} from "./features/metadata/metadataSlice";
import  { gen3ServicesReducer, gen3ServicesReducerPath} from "./features/gen3/gen3Api";
import {combineReducers} from "@reduxjs/toolkit";
import { userReducer } from "./features/user/userSlice";

export const rootReducer = combineReducers( {
  [mdsReducerPath]: mdsReducer,
  [gen3ServicesReducerPath]: gen3ServicesReducer,
  user: userReducer
});

export type CoreState = ReturnType<typeof rootReducer>;
