import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CoreState } from '../../reducers';

/**
 * Defines the modals slice of the Redux store.
 * This slice is used to control the display of standard Gen3 modals.
 * and can be extended to add custom modals by representing them as strings.
 */
export enum Modals {
  'FirstTimeModal' = 'FirstTimeModal',
  'SessionExpireModal' = 'SessionExpireModal',
  'NoAccessModal' = 'NoAccessModal',
  'CreateCredentialsAPIKeyModal' = 'CreateCredentialsAPIKeyModal',
  'GeneralErrorModal' = 'GeneralErrorModal',
}

// Type for the current modal in the store
// This can be a standard Gen3 modal, a custom modal (via string), or null
type CurrentModal = Modals | string | null;

export interface ModalState {
  currentModal: CurrentModal;
  message?: string;
}

const initialState: ModalState = {
  currentModal: null,
};

//Creates a modal slice for tracking showModal and hideModal state.
const slice = createSlice({
  name: 'modals',
  initialState,
  reducers: {
    showModal: (
      state: ModalState,
      action: PayloadAction<{ modal: Modals; message?: string }>,
    ) => {
      state.currentModal = action.payload.modal;
      state.message = action.payload.message;
      return state;
    },
    hideModal: (state: ModalState) => {
      state.currentModal = null;
      return state;
    },
  },
});

export const modalReducer = slice.reducer;
export const { showModal, hideModal } = slice.actions;

export const selectCurrentModal = (state: CoreState): CurrentModal =>
  state.modals.currentModal;

export const selectCurrentMessage = (state: CoreState): string | undefined =>
  state.modals.message;
