import {
  type RemoteSupportConfiguration,
  type RemoteSupportRequestAction,
  MissingServiceConfigurationError,
} from './remoteSupport/types';
import {
  getRemoteSupportServiceRegistry,
  registerDefaultRemoteSupport,
} from './remoteSupport';

export * from './requestorSlice';

export {
  type RemoteSupportConfiguration,
  type RemoteSupportRequestAction,
  MissingServiceConfigurationError,
  getRemoteSupportServiceRegistry,
  registerDefaultRemoteSupport,
};
