// import and export all modals

import { BaseModal } from './BaseModal';
import { FirstTimeModal } from './FirstTimeModal/FirstTimeModal';
import { SessionExpiredModal } from './SessionExpiredModal';
import { CreateCredentialsAPIKeyModal } from './CreateCredentialsAPIKeyModal';
import { NoAccessModal } from './NoAccessModal';
import Gen3ModalsProvider from './Gen3ModalsProvider';
import { type ModalsConfig } from './types';
import { gen3Modals } from './registerModals';

export {
  gen3Modals,
  BaseModal,
  FirstTimeModal,
  SessionExpiredModal,
  CreateCredentialsAPIKeyModal,
  NoAccessModal,
  Gen3ModalsProvider,
  type ModalsConfig,
};
