import {
  sowerJobBuilderRegistry,
  sowerOutputActionRegistry,
} from './sowerActionFactory';
import { notificationOutputAction, sendPFBToURL } from './outputActions';
import { createPFBFromDataLibraryList } from './sowerJobActions';

// register functions

export const registerBaseSowerActions = () => {
  sowerJobBuilderRegistry.register(
    'export-user-data-library',
    createPFBFromDataLibraryList,
  );
  sowerOutputActionRegistry.register('handoff-pfb-to-url', sendPFBToURL);
  sowerOutputActionRegistry.register('notification', notificationOutputAction);
};
