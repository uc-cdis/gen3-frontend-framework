import { combineReducers } from 'redux';
// import { persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';
import { createAppApiForRTKQ } from '@gen3/core';
import { filtersExpandedReducer } from './FilterExpandSlice';
import { selectedFacetsReducer } from './SelectedFacetsSlice';
import { cohortReducer } from './CohortSlice';
import { getCookie } from 'cookies-next';

// const persistConfig = {
//   key: _APP_NAME,
//   version: 1,
//   storage,
//   whitelist: ['filterExpandState'],
// };

export interface GraphQLRequest {
  readonly query: string;
  readonly variables?: Record<string, unknown>;
}

const reducers = combineReducers({
  selectedIndexFacets: selectedFacetsReducer,
  filtersExpandedState: filtersExpandedReducer,
  cohorts: cohortReducer,
});

// create the store, context and selector for the Cohort Discovery app
// Note the project app has a local store and context which isolates
// the filters and other store/cache values
export const {
  appApi: cohortDiscoveryApi,
  useAppSelector: useAppSelector,
  useAppDispatch: useAppDispatch,
  useAppStore: useAppStore,
  appStore: AppStore,
  appContext: AppContext,
  appReducers,
} = createAppApiForRTKQ(
  'cohortDiscovery',
  reducers,
  async (query: GraphQLRequest) => {
    let accessToken = undefined;
    if (process.env.NODE_ENV === 'development') {
      // NOTE: This cookie can only be accessed from the client side
      // in development mode. Otherwise, the cookie is set as httpOnly
      accessToken = getCookie('credentials_token');
    }

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };

    console.log('baseQuery', query);
    try {
      const response = await fetch(`/api/analysis/cohortDiscovery`, {
        headers: headers,
        method: 'POST',
        body: JSON.stringify(query),
      });
      return { data: await response.json() };
    } catch (e: unknown) {
      if (e instanceof Error) return { error: e.message };
      return { error: e };
    }
  },
);

export type AppState = ReturnType<typeof appReducers>;
