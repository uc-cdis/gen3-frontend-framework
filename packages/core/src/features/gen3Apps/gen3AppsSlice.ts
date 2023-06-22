import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import React from 'react';
import { CoreState } from '../../reducers';
import { lookupGen3App } from './gen3AppRegistry';

export interface Gen3AppsState {
  readonly gdcApps: Readonly<Record<string, Gen3AppMetadata>>;
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
  gdcApps: {},
};

const slice = createSlice({
  name: 'gdcapps',
  initialState,
  reducers: {
    addGen3AppMetadata: (state, action: PayloadAction<Gen3AppMetadata>) => {
      const { id, requiredEntityTypes } = action.payload;

      state.gdcApps[id] = {
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
  Object.keys(state.gdcApps.gdcApps);

export const selectAllGen3AppMetadata = (
  state: CoreState,
): ReadonlyArray<Gen3AppMetadata> => Object.values(state.gdcApps.gdcApps);

export const selectGen3AppMetadataById = (
  state: CoreState,
  appId: string,
): Gen3AppMetadata => state.gdcApps.gdcApps[appId];

export const selectGen3AppById = (appId: string): React.ReactNode =>
  lookupGen3App(appId);
