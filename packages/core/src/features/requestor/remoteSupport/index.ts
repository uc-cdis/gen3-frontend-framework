import {
  type RemoteSupportRequest,
  type MissingServiceConfigurationError,
} from './types';

import { getRemoteSupportServiceRegistry } from './registeredRemoteSupportServices';
import { registerDefaultRemoteSupport } from './registerDefaultRemoteSupport';

export {
  type RemoteSupportRequest,
  type MissingServiceConfigurationError,
  getRemoteSupportServiceRegistry,
  registerDefaultRemoteSupport,
};
