import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CoreState } from '../../reducers';

export enum Modals {
  'FirstTimeModal' = 'FirstTimeModal',
  'SessionExpireModal' = 'SessionExpireModal',
}

export interface ModalState {
  currentModal: Modals | null;
  message?: string;
}

const initialState: ModalState = {
  currentModal: null,
};

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

export const selectCurrentModal = (state: CoreState): Modals | null =>
  state.modals.currentModal;

export const selectCurrentMessage = (state: CoreState): string | undefined =>
  state.modals.message;