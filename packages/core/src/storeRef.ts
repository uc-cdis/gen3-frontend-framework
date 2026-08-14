import type { CoreState } from './reducers';

let _getState: (() => CoreState) | undefined;

export const registerGetState = (getState: () => CoreState): void => {
  _getState = getState;
};

export const getRegisteredState = (): CoreState => {
  if (!_getState)
    throw new Error('Store not initialized — call registerGetState first.');
  return _getState();
};
