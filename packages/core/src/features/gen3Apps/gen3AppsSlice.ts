import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import React from 'react';
import { CoreState } from '../../reducers';
import { lookupGen3App } from './gen3AppRegistry';

export interface Gen3AppsState {
  readonly gen3Apps: Readonly<Record<string, Gen3AppMetadata>>;
  readonly currentAppId?: string;
}

export interface Gen3AppMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly requiredEntityTypes: ReadonlyArray<EntityType>;
}

export type EntityType = 'case' | 'gene' | 'ssm' | 'cnv' | 'file';

const initialState: Gen3AppsState = {
  gen3Apps: {},
};

const slice = createSlice({
  name: 'gen3Apps',
  initialState,
  reducers: {
    addGen3AppMetadata: (state, action: PayloadAction<Gen3AppMetadata>) => {
      const { id, requiredEntityTypes } = action.payload;

      state.gen3Apps[id] = {
        ...action.payload,
        // need to turn a ReadonlyArray into a mutable array for immer's WritableDraft
        requiredEntityTypes: [...requiredEntityTypes],
      };
    },
  },
});

export const gen3AppReducer = slice.reducer;

export const { addGen3AppMetadata } = slice.actions;

export const selectGen3AppIds = (state: CoreState): ReadonlyArray<string> =>
  Object.keys(state.gen3Apps.gen3Apps);

export const selectAllGen3AppMetadata = (
  state: CoreState,
): ReadonlyArray<Gen3AppMetadata> => Object.values(state.gen3Apps.gen3Apps);

export const selectGen3AppMetadataById = (
  state: CoreState,
  appId: string,
): Gen3AppMetadata => state.gen3Apps.gen3Apps[appId];

export const selectGen3AppById = (appId: string): React.ReactNode =>
  lookupGen3App(appId);
