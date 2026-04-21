import React, { useEffect, useMemo, useState } from 'react';
import { useCookies } from 'react-cookie';
import { openContextModal } from '@mantine/modals';
import {
  type CoreState,
  Modals,
  selectCurrentModal,
  useCoreSelector,
  useGetAuthzMappingsQuery,
  useGetCSRFQuery,
  useGetSowerJobListQuery,
} from '@gen3/core';
import { SessionExpiredModal } from './SessionExpiredModal';
import { ModalsConfig } from './types';
import { defaultComposer } from 'default-composer';
import { ContentType } from '../Content/TextContent';
import { useDeepCompareEffect, useDeepCompareMemo } from 'use-deep-compare';
import { useIsAuthenticated } from '../../lib/session/session';
import { useFirstTimeUse } from './FirstTimeModal/hooks';
import useSowerJobEventBus from '../../features/Sower/useSowerJobEventBus';
import { showNotification } from '@mantine/notifications';

interface Gen3StandardModalsProviderProps {
  config: ModalsConfig;
  children: React.ReactNode;
}

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
  const { isError } = useGetCSRFQuery(undefined, { refetchOnFocus: true });
  useGetAuthzMappingsQuery();

  const { showModal, markSeen } = useFirstTimeUse();

  const [cookie] = useCookies(['Gen3-first-time-use']);
  const modal = useCoreSelector((state: CoreState) =>
    selectCurrentModal(state),
  );
  const [sowerJobsPollingInterval, setSowerJobsPollingInterva] =
    useState<number>(0);
  const modalsConfig = useMemo(
    () => defaultComposer(defaultConfig, config),
    [],
  );
  const { isAuthenticated } = useIsAuthenticated();

  const { data } = useGetSowerJobListQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: isAuthenticated,
    refetchOnFocus: isAuthenticated,
    refetchOnReconnect: isAuthenticated,
  });
  const { on, off } = useSowerJobEventBus();
  const activeJobs = useDeepCompareMemo(
    () =>
      (data || [])
        .filter((job) => job.status === 'Running')
        .map((job) => job.uid),
    [data],
  );

  useEffect(() => {
    on('Gen3ModalsProvider', activeJobs, (uid) =>
      showNotification({ message: `Job ${uid} completed` }),
    );

    return () => off('Gen3ModalsProvider');
  }, [activeJobs, off, on]);

  useDeepCompareEffect(() => {
    if (
      !modalsConfig.systemUseModal?.enabled === true ||
      (modalsConfig.systemUseModal.showOnlyOnLogin && !isAuthenticated)
    )
      return;

    if (showModal && modalsConfig.systemUseModal?.enabled === true) {
      openContextModal({
        modal: 'firstTimeModal',
        title: modalsConfig.systemUseModal.title,
        size: '60%',
        closeOnClickOutside: false,
        closeOnEscape: false,
        withCloseButton: false,
        innerProps: {
          config: modalsConfig.systemUseModal,
          markSeen,
        },
      });
    }
  }, [
    cookie['Gen3-first-time-use'],
    modalsConfig.systemUseModal.enabled,
    isAuthenticated,
  ]);

  if (isError) {
    return (
      <div className="w-full m-20">
        Error Getting status check from commons.
      </div>
    );
  }

  return (
    <div className="bg-base-max">
      {modal === Modals.SessionExpireModal && (
        <SessionExpiredModal
          openModal={true}
          config={modalsConfig.sessionExpiredModal}
        />
      )}
      {children}
    </div>
  );
};

export default Gen3ModalsProvider;
