import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useContext } from 'react';
import useSowerJobEventBus from './useSowerJobEventBus';
import useJobOutputAction from './useJobOutputAction';

interface SowerEventBus {
  on: (
    listenerKey: string,
    newPollers: string[],
    callback: (uid: string) => void,
  ) => void;
  off: (listenerKey: string) => void;
  update: (job: string) => void;
}

const SowerContext = createContext<SowerEventBus | null>(null);

export const SowerProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const eventBus = useSowerJobEventBus();
  useJobOutputAction();
  return (
    <SowerContext.Provider value={eventBus}>{children}</SowerContext.Provider>
  );
};

export const useSowerContext = (): SowerEventBus => {
  const ctx = useContext(SowerContext);
  if (!ctx)
    throw new Error('useSowerContext must be used within a SowerProvider');
  return ctx;
};
