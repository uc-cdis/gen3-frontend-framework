import { Text } from '@mantine/core';
import { useCookies } from 'react-cookie';
import { BaseModal } from './BaseModal';
import TextContent, { TextContentProps } from '../Content/TextContent';

interface FirstTimeModalProps {
  readonly openModal: boolean;
  content: TextContentProps;
}

export const FirstTimeModal = ({
  openModal,
  content,
}: FirstTimeModalProps ): JSX.Element => {
  const [cookie, setCookie] = useCookies(['Gen3-First-Time-Use']);

  const handleAccept = () => {
    cookie['Gen3-First-Time-Use'] || setCookie('Gen3-First-Time-Use', true);
  };

  return (
    <BaseModal
      title={
        <Text size="lg" className="font-medium font-heading">
          Warning
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
        <TextContent key={'first_time_use_modal'} {...content} />
      </div>
    </BaseModal>
  );
};
