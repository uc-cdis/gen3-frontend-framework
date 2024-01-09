import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { coreStore } from './store';
import { CoreContext } from './hooks';

interface CoreProviderProps {
  children?: ReactNode | undefined;
}

export const CoreProvider = ({
  children,
}: CoreProviderProps) => {
  return (
    <Provider store={coreStore} context={CoreContext}>
      {children}
    </Provider>
  );
};
