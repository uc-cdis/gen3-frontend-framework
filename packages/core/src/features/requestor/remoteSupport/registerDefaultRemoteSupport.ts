import { getDefaultRegistry } from './registeredRemoteSupportServices';
import { createZendeskTicket } from './zenDesk';

export const registerDefaultRemoteSupport = () => {
  const registry = getDefaultRegistry();
  registry.registerService('zenDesk', createZendeskTicket);
};
