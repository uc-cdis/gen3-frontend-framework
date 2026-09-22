import { sowerOutputActionRegistry } from './sowerActionFactory';
import { notificationOutputAction, sendPFBToURL } from './outputActions';

// register functions

export const registerBaseSowerActions = () => {
  sowerOutputActionRegistry.register('handoff-pfb-to-url', sendPFBToURL);
  sowerOutputActionRegistry.register('notification', notificationOutputAction);
};
