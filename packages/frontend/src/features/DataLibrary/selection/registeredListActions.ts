import type { ListActionFunction } from './types';
import { createActionRegistry } from './registeredActions';

// List-level (ListActionFunction) registry
const {
  registerAction: registerListAction,
  findAction: findListAction,
  NullAction: NullListAction,
} = createActionRegistry<ListActionFunction>();

export { registerListAction, findListAction, NullListAction };
