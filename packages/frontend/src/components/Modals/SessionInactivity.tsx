import React, { useCallback } from 'react';
import { ContextModalProps } from '@mantine/modals';
import { useRouter } from 'next/router';
import { SessionInactivityModalConfiguration } from './types';

interface SessionInactivitydModalProps {
  configuration: SessionInactivityModalConfiguration | undefined;
}


const calculateMinRemaining = (inactivityWarningTime) => {
  const minRemain = Math.ceil((inactivityWarningTime - Date.now()) / 60000);
  return [`Due to inactivity, your session will expire in ${minRemain} minute${minRemain > 1 ? 's' : ''}`];
};

export const SessionExpiredModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<SessionInactivitydModalProps>) => {
  const { configuration } = innerProps;
  const router = useRouter();
  const onLogout = useCallback(() => {
    router.push(configuration?.externalLoginUrl || '/Login');
  }, [configuration?.externalLoginUrl, router]);

    const message = calculateMinRemaining(configuration?.inactivityWarningTime || Date.now());

      <div className="border-y border-y-base-darker py-4 space-y-4 font-content">
        <p>
          Your session is expiring or you are logged out. Please log in to
          continue.
        </p>
      </div>
  );
};
