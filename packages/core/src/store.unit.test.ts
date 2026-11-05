import { coreStore } from './store';
import { CoreState } from './reducers';

// oxlint-disable-next-line jest/no-export
export const getInitialCoreState = (): CoreState => coreStore.getState();

test('placeholder', () => {
  expect(true).toBeTruthy();
});
