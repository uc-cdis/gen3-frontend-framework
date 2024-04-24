import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { rootReducer } from './reducers';
import { gen3ServicesReducerMiddleware } from './features/gen3/gen3Api';
import { guppyAPISliceMiddleware} from './features/guppy';
import { userAuthApiMiddleware } from './features/user/userSliceRTK';

export const coreStore = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userAuthApiMiddleware, gen3ServicesReducerMiddleware, guppyAPISliceMiddleware),
});

setupListeners(coreStore.dispatch);

export type CoreDispatch = typeof coreStore.dispatch;
