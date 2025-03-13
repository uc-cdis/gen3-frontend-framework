import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { coreStore } from './store';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

const persistor = persistStore(coreStore);

export const CoreProvider: React.FC<Record<string, unknown>> = ({
  children,
}: PropsWithChildren) => {
  return (
    <Provider store={coreStore}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};
