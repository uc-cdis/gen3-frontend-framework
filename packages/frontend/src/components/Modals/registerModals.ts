import BaseContextModal from './BaseContextModal';
import { SaveCohortModal } from './SaveCohortModal';
import { FirstTimeModal } from './FirstTimeModal/FirstTimeModal';
import JobModal from './JobModal';
import SessionExpiringModal from './SessionExpiringModal';

export const gen3Modals = {
  baseContextModal: BaseContextModal,
  saveCohortModal: SaveCohortModal,
  firstTimeModal: FirstTimeModal,
  jobModal: JobModal,
  sessionExpiringModal: SessionExpiringModal,
};
