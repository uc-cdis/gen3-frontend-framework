import {
  sowerJobBuilderRegistry,
  sowerOutputActionRegistry,
} from './sowerActionFactory';
import {
  notificationOutputAction,
  sendPFBToURL,
  showSowerJobCompleteModalOutputAction,
} from './outputActions';
import { createPFBFromDataLibraryList } from './sowerJobActions';
import { buildExportFilesToZipJob } from './exportFilesToZip';

// register functions

export const registerBaseSowerActions = () => {
  sowerJobBuilderRegistry.register(
    'export-user-data-library',
    createPFBFromDataLibraryList,
  );
  sowerJobBuilderRegistry.register(
    'export-files-to-zip',
    buildExportFilesToZipJob,
  );
  sowerOutputActionRegistry.register('handoff-pfb-to-url', sendPFBToURL);
  sowerOutputActionRegistry.register('notification', notificationOutputAction);
  sowerOutputActionRegistry.register(
    'showSowerJobComplete',
    showSowerJobCompleteModalOutputAction,
  );
};
