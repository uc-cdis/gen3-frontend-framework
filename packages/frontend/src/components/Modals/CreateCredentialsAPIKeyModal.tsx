import { Text } from '@mantine/core';
import { BaseModal } from './BaseModal';
import FileSaver from 'file-saver';
import { APICredentials } from '../Profile/types';
import { LoadingOverlay } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';

export const saveToFile = (
  savingStr: string,
  filename = 'credentials.json',
) => {
  const blob = new Blob([savingStr], { type: 'text/json' });
  FileSaver.saveAs(blob, filename);
};

interface CreateCredentialsAPIKeyModalProps {
  openModal: boolean;
  credentials: APICredentials;
}

export const CreateCredentialsAPIKeyModal = ({
  openModal,
  credentials,
}: CreateCredentialsAPIKeyModalProps): JSX.Element => {

  const clipboard = useClipboard({ timeout: 500 });
const copyToClipboard = (credentials:APICredentials) => {
    clipboard.copy(JSON.stringify(credentials));
  };

  return (
    <BaseModal
      title={
        <Text size="lg" className="font-medium font-heading">
          Created API Key
        </Text>
      }
      openModal={openModal}
      size="60%"
      leftButtons={[
        {
          title: 'Close',
          hideModalOnClick: true,
          dataTestId: 'button-create-api-key-close',
        },
      ]}
      buttons={[
        {
          title: 'Download',
          hideModalOnClick: false,
          dataTestId: 'button-create-api-key-download',
          onClick: () => {
            saveToFile(JSON.stringify(credentials), 'credentials.json');
          },
        },
        {
          title: 'Copy',
          hideModalOnClick: false,
          dataTestId: 'button-create-api-key-copy',
          onClick: () => {
            copyToClipboard(credentials);
          },
        },
      ]}
      withCloseButton={true}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <div className="flex flex-col border-y border-y-base-darker py-4 space-y-4 font-content">
        {
          credentials.api_key === '' && <LoadingOverlay visible={true} /> // pragma: allowlist-secret;
        }
        <p>
          This key is only shown once. Please copy or save it and store it in a
          safe place.
        </p>
        <div>
          <strong>Key ID:</strong> {credentials.key_id}
        </div>
        <div>
          <strong>API Key:</strong> {credentials.api_key.replace(/./g, '*')}
        </div>
      </div>
    </BaseModal>
  );
};
