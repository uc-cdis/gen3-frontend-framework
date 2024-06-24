import { Text } from '@mantine/core';
import { useCookies } from 'react-cookie';
import { BaseModal } from './BaseModal';
import TextContent from '../Content/TextContent';
import { FirstTimeModalConfig } from './types';

interface FirstTimeModalProps {
  readonly openModal: boolean;
  config: FirstTimeModalConfig;
}

export const FirstTimeModal = ({
  openModal,
  config,
}: FirstTimeModalProps ): JSX.Element => {
  const [cookie, setCookie] = useCookies(['Gen3-first-time-use']);

  const handleAccept = () => {
    cookie['Gen3-first-time-use'] || setCookie('Gen3-first-time-use', true, {
      maxAge: 60 * 60 * 24 * (config?.expireDays ?? 365),
    });
  };

  return (
    <BaseModal
      title={
        <Text size="lg" className="font-medium font-heading">
          {config.title ?? 'Welcome to Gen3'}
        </Text>
      }
      openModal={openModal}
      size="60%"
      buttons={[
        {
          title: 'Accept',
          onClick: handleAccept,
          hideModalOnClick: true,
          dataTestId: 'button-intro-warning-accept',
        },
      ]}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <div className="border-y border-y-base-darker py-4 space-y-4 font-content">
        <TextContent key={'first_time_use_modal'} {...config.content} />
      </div>
    </BaseModal>
  );
};
