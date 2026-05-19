import React from 'react';
import { Button, CopyButton } from '@mantine/core';
import { MdKeyboardDoubleArrowLeft as BackIcon } from 'react-icons/md';
import { FiLogIn as LoginIcon } from 'react-icons/fi';
import { useIsUserLoggedIn } from '@gen3/core';
import { useDiscoveryContext } from '../../Discovery/DiscoveryProvider';

interface StudyDetailsHeaderButtonsProps {
  onClose: () => void;
  permalink: string;
}
const StudyDetailsHeaderButtons: React.FC<StudyDetailsHeaderButtonsProps> = ({
  onClose,
  permalink,
}) => {
  const requiresLogin = !useIsUserLoggedIn();
  const { discoveryConfig: config } = useDiscoveryContext();
  const showSubmitButton = config.detailView?.showSubmitButton;

  return (
    <>
      <Button leftSection={<BackIcon />} onClick={onClose} variant="outline">
        Back
      </Button>
      {showSubmitButton && (
        <Button
          leftSection={<LoginIcon size={14} />}
          variant="subtle"
          color="black"
          size="xs"
        >
          {requiresLogin
            ? 'Login to submit variable level metadata'
            : 'Request Access to Submit Variable-level Metadata'}
        </Button>
      )}
      <CopyButton value={permalink}>
        {({ copied, copy }) => (
          <Button color={copied ? 'primary' : 'secondary'} onClick={copy}>
            {copied ? 'Copied Permalink' : 'Permalink'}
          </Button>
        )}
      </CopyButton>
    </>
  );
};
export default StudyDetailsHeaderButtons;
