import React from "react";
 import {
     createDispatchHook,
     createSelectorHook,
     createStoreHook,
     ReactReduxContextValue,
     TypedUseSelectorHook
 } from "react-redux";
 import {  Store } from "@reduxjs/toolkit";
 import { CoreDispatch } from "./store";
 import { CoreState } from "./reducers";

 // From here down is react-related code. If we wanted to create a UI-agnotic core,
// we could need to move the following code and the provider into a new workspace,
// such as core-react.


/**
 * The initial context is never used in practice. A little casting voodoo to satisfy TS.
 *
 * Note: Should the action type be AnyAction (from redux) or PayloadAction (from redux-toolkit)?
 * If we are creating all of our actions through RTK, then PayloadAction might be the
 * correct opinionated type.
 */

export const CoreContext = React.createContext(
    undefined as unknown as ReactReduxContextValue<CoreState>,
);

 export const useCoreSelector: TypedUseSelectorHook<CoreState> = createSelectorHook(CoreContext);

 export const useCoreDispatch: () => CoreDispatch = createDispatchHook(CoreContext);

 export const useCoreStore : () => Store = createStoreHook(CoreContext);
