import { getRemoteSupportServiceRegistry } from './registeredRemoteSupportServices';
import { createZendeskTicket } from './zenDesk';

export const registerDefaultRemoteSupport = () => {
  const registry = getRemoteSupportServiceRegistry();
  registry.registerService('zenDesk', createZendeskTicket);
};
