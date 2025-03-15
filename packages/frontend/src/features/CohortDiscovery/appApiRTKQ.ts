// import { createAppApiForRTKQ } from '@gen3/core';
// import { filtersExpandedReducer } from './FilterExpandSlice';
// import { selectedFacetsReducer } from './SelectedFacetsSlice';
// import { cohortReducer } from './CohortSlice';
// import { getCookie } from 'cookies-next';
// import { persistReducer } from 'redux-persist';
//
// // import type { PersistConfig, PersistState } from 'redux-persist';
// // import type { Action, Reducer } from 'redux';
// // /**
// //  * Update declaration of persistReducer to support redux v5
// //  */
// // declare module 'redux-persist' {
// //   export function persistReducer<S, A extends Action = Action, P = S>(
// //     config: PersistConfig<S>,
// //     baseReducer: Reducer<S, A, P>,
// //   ): Reducer<
// //     S & { _persist: PersistState },
// //     A,
// //     P & { _persist?: PersistState }
// //   >;
// // }
//
// import storage from './storage-persist';
//
// export const _APP_NAME = 'CohortDiscovery'; // This wil be the route name of the app
// export const _APP_VERSION = '1.0.0';
//
// const persistConfig = {
//   key: _APP_NAME,
//   version: 1,
//   storage,
//   // whitelist: ['selectedIndexFacets', 'filtersExpandedState', 'cohorts'],
// };
//
// export interface GraphQLRequest {
//   readonly query: string;
//   readonly variables?: Record<string, unknown>;
// }
//
// // const reducers = combineReducers({
// //   selectedIndexFacets: persistReducer(persistConfig, selectedFacetsReducer),
// //   filtersExpandedState: filtersExpandedReducer,
// //   cohorts: cohortReducer,
// // });
//
// const reducers = {
//   selectedIndexFacets: selectedFacetsReducer,
//   filtersExpandedState: filtersExpandedReducer,
//   cohorts: cohortReducer,
// };
//
// const persistedReducers = persistReducer(persistConfig, reducers);
//
// // create the store, context and selector for the Cohort Discovery app
// // Note the project app has a local store and context which isolates
// // the filters and other store/cache values
// export const {
//   appApi: cohortDiscoveryApi,
//   useAppSelector: useAppSelector,
//   useAppDispatch: useAppDispatch,
//   useAppStore: useAppStore,
//   appStore: AppStore,
//   appContext: AppContext,
// } = createAppApiForRTKQ(
//   'cohortDiscovery/api',
//   _APP_NAME,
//   _APP_VERSION,
//   reducers,
//   async (query: GraphQLRequest) => {
//     let accessToken = undefined;
//     if (process.env.NODE_ENV === 'development') {
//       // NOTE: This cookie can only be accessed from the client side
//       // in development mode. Otherwise, the cookie is set as httpOnly
//       accessToken = getCookie('credentials_token');
//     }
//
//     const headers = {
//       Accept: 'application/json',
//       'Content-Type': 'application/json',
//       'Access-Control-Allow-Origin': '*',
//       ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
//     };
//
//     try {
//       const response = await fetch(`/api/analysis/cohortDiscovery`, {
//         headers: headers,
//         method: 'POST',
//         body: JSON.stringify(query),
//       });
//       return { data: await response.json() };
//     } catch (e: unknown) {
//       if (e instanceof Error) return { error: e.message };
//       return { error: e };
//     }
//   },
// );
//
// export type AppState = ReturnType<typeof AppStore.getState>;
