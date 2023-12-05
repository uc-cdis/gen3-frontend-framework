// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { CoreState } from "../reducers";
//
//
//
// export interface DataTypeConfig {
//     readonly dataType: string;
//     readonly title: string;
//     readonly tabs: Record<string,TabsConfig>; // indexed by category
// }
//
// export type CohortBuilderConfiguration = Record<string, DataTypeConfig>; // indexed by dataType
//
// const initialState:CohortBuilderConfiguration  = {
//   "default": {
//     dataType: "default",
//     title: "Default",
//     tabs: { "default" : { category: "default", title: "default", fields: [] }}
//   }
// };
//
// export interface CohortBuilderField {
//   readonly dataType: string; // the index of the facet
//   readonly category: string; // category name
//   readonly fieldName: string;
// }
//
// const slice = createSlice({
//   name: "cohort/builderConfig",
//   initialState,
//   reducers: {
//     setCohortBuilderConfig: (_, action: PayloadAction<CohortBuilderConfiguration>) => {
//         return action.payload;
//     },
//     addFilterToCohortBuilder: (
//       state,
//       action: PayloadAction<CohortBuilderField>,
//     ) => {
//       if (action.payload.category in state)
//         if (
//           // only add if not already added
//           !state[action.payload.dataType].tabs[action.payload.category].fields.includes(
//             action.payload.fieldName
//           )
//         )
//           state[action.payload.category].tabs[action.payload.category].fields = [
//             ...state[action.payload.category].tabs[action.payload.category].,
//             action.payload.fieldName,
//           ];
//     },
//     removeFilterFromCohortBuilder: (
//       state,
//       action: PayloadAction<CohortBuilderField>,
//     ) => {
//       if (action.payload.category in state)
//         state[action.payload.category].fields = state[
//           action.payload.category
//         ].fields.filter((x) => x != action.payload.facetName);
//     },
//     resetCohortBuilderToDefault: () => initialState,
//   },
//   extraReducers: {},
// });
//
// export const cohortBuilderConfigReducer = slice.reducer;
// export const {
//   setCohortBuilderConfig,
//   addFilterToCohortBuilder,
//   removeFilterFromCohortBuilder,
//   resetCohortBuilderToDefault,
// } = slice.actions;
//
// export const selectCohortBuilderConfig = (
//   state: CoreState,
// ): Record<string, CohortBuilderCategory> => state.cohort.builderConfig;
//
// /**
//  * returns an array of all the filters used in the current configuration.
//  * @param state - current core state/store
//  */
// export const selectCohortBuilderConfigCategories= (state: CoreState): string[] =>
//   Object.values(state.cohortBuilderConfig).reduce(
//     (filters: string[], category) => {
//       return [...filters, ...category.fields];
//     },
//     [] as string[],
//   );
//
// export const selectCohortBuilderConfigCategory = (
//   state: CoreState,
//   category: string,
// ): CohortBuilderCategory => state.cohortBuilderConfig[category];
