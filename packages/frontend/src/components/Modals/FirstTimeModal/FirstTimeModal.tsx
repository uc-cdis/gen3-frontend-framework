import React from 'react';
import { ContextModalProps } from '@mantine/modals';
import { Button } from '@mantine/core';
import { useCookies } from 'react-cookie';
import TextContent from '../../Content/TextContent';
import { FirstTimeModalConfig } from '../types';

export interface FirstTimeModalProps {
  config: FirstTimeModalConfig;
  markSeen: (_arg: number) => void;
}

export const FirstTimeModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<FirstTimeModalProps>) => {
  const { config, markSeen } = innerProps;
  const [cookie, setCookie] = useCookies(['Gen3-first-time-use']);

  const handleAccept = () => {
    // if (!cookie['Gen3-first-time-use']) {
    //   const maxAge = 60 * 60 * 24 * (config?.expireDays ?? 365);
    //   setCookie('Gen3-first-time-use', true, { maxAge });
    // }
    markSeen(config?.expireDays ?? 365);
    context.closeModal(id);
  };

  return (
    <>
      <div className="border-y border-y-base-darker p-4 space-y-4 font-content">
        <TextContent key="first_time_use_modal" {...config.content} />
      </div>
      <div className="flex justify-end mt-2.5 gap-2 p-4">
        <Button
          data-testid="button-intro-warning-accept"
          onClick={handleAccept}
          className="!bg-primary hover:!bg-primary-darker"
        >
          Accept
        </Button>
      </div>
    </>
  );
};
