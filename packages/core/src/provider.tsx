import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { coreStore } from './store';

export const CoreProvider: React.FC<Record<string, unknown>> = ({
  children,
}: PropsWithChildren) => {
  return <Provider store={coreStore}>{children}</Provider>;
};
