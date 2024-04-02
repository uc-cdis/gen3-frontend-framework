import { ReactElement, useMemo } from 'react';
import { useCookies } from 'react-cookie';
import {
  type CoreState,
  Modals,
  selectCurrentModal,
  showModal,
  useCoreDispatch,
  useCoreSelector,
} from '@gen3/core';
import { FirstTimeModal } from './FirstTimeModal';
import { ModalsConfig } from './types';
import { defaultComposer } from 'default-composer';
import { ContentType } from '../Content/TextContent';
import { useDeepCompareEffect } from 'use-deep-compare';
import { useIsAuthenticated } from '../../lib/session/session';

interface Gen3StandardModalsProviderProps {
  config: ModalsConfig;
  children: React.ReactNode;
}

const getModal = (
  modal: Modals | string | null,
  config: ModalsConfig,
): ReactElement | null => {
  let res: ReactElement | null = null;
  switch (modal) {
    case Modals.FirstTimeModal:
      res = config.systemUseModal?.enabled ? (
        <FirstTimeModal openModal={true} config={config.systemUseModal} />
      ) : null;
  }
  return res;
};
const defaultConfig: ModalsConfig = {
  systemUseModal: {
    enabled: true,
    title: 'Welcome to Gen3',
    content: {
      text: [
        'This is your first time using Gen3.',
        'Please read and accept the terms of use.',
      ],
      type: ContentType.TextArray,
    },
    scrollToEnableAccept: true,
    expireDays: 365,
  },
};

const Gen3ModalsProvider = ({
  config,
  children,
}: Gen3StandardModalsProviderProps) => {
  const [cookie] = useCookies(['Gen3-first-time-use']);
  const dispatch = useCoreDispatch();
  const modal = useCoreSelector((state: CoreState) =>
    selectCurrentModal(state),
  );

  const modalsConfig = useMemo(
    () => defaultComposer(defaultConfig, config),
    [],
  );
  const { isAuthenticated } = useIsAuthenticated();
  useDeepCompareEffect(() => {
    if (!cookie['Gen3-first-time-use'] && modalsConfig.systemUseModal.enabled) {
      if (modalsConfig.systemUseModal.showOnlyOnLogin && !isAuthenticated)
        return;
      dispatch && dispatch(showModal({ modal: Modals.FirstTimeModal }));
    }
  }, [
    cookie['Gen3-first-time-use'],
    dispatch,
    modalsConfig.systemUseModal.enabled,
  ]);

  return (
    <>
      {modal && getModal(modal, modalsConfig)}
      {children}
    </>
  );
};

export default Gen3ModalsProvider;
