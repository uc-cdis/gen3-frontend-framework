import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { FacetDefinition } from '@gen3/core';

/**
 * State structure for facet definitions, organized by index and field
 */
type FacetDefinitionState = Record<string, Record<string, FacetDefinition>>;

const initialState: FacetDefinitionState = {};

/**
 * Redux slice for managing facet definitions in CohortDiscovery
 */
const facetDefinitionsSlice = createSlice({
  name: 'CohortDiscovery/facetDefinitions',
  initialState,
  reducers: {
    addFacetDefinition: (
      state,
      action: PayloadAction<{ index: string; definition: FacetDefinition }>,
    ) => {
      const { index, definition } = action.payload;

      // Create index entry if it doesn't exist
      if (!state[index]) {
        state[index] = {};
      }

      // Add or update the definition for the specified field
      state[index][definition.field] = definition;
    },
    addFacetDefinitions: (
      state,
      action: PayloadAction<{ index: string; definitions: FacetDefinition[] }>,
    ) => {
      const { index, definitions } = action.payload;

      // Create index entry if it doesn't exist
      if (!state[index]) {
        state[index] = {};
      }

      // Add or update the definitions for the specified fields
      definitions.forEach((definition) => {
        state[index][definition.field] = definition;
      });
    },
    clearFacetDefinitions: (state, action: PayloadAction<string>) => {
      state[action.payload] = {};
    },
  },
});

export const facetDefinitionsReducer = facetDefinitionsSlice.reducer;
export const { addFacetDefinition, addFacetDefinitions } =
  facetDefinitionsSlice.actions;
