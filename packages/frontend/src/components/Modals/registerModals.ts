import BaseContextModal from './BaseContextModal';
import { SaveCohortModal } from './SaveCohortModal';
import { FirstTimeModal } from './FirstTimeModal/FirstTimeModal';
import { SessionInactivityModal } from './SessionInactivityModal';

export const gen3Modals = {
  baseContextModal: BaseContextModal,
  saveCohortModal: SaveCohortModal,
  firstTimeModal: FirstTimeModal,
  sessionInactivityModal: SessionInactivityModal,
};

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof gen3Modals;
  }
}
