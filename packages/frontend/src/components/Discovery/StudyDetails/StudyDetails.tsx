import { Button, CopyButton, Drawer } from '@mantine/core';
import StudyDetailsPanel from './StudyDetailsPanel';
import React, { useEffect } from 'react';
import { useDiscoveryConfigContext } from '../DiscoveryConfigProvider';
import { useDisclosure } from '@mantine/hooks';
import { MdKeyboardDoubleArrowLeft as BackIcon } from 'react-icons/md';

const StudyDetails = () => {
  const { discoveryConfig: config, studyDetails } = useDiscoveryConfigContext();
  const [opened, { open, close }] = useDisclosure(false);
  const index = config?.minimalFieldMapping?.uid ?? 'unknown';
  let permalink = 'Discovery/notfound';
  if (studyDetails) {

    const studyId = studyDetails[index];
    const pagePath = `/discovery/${encodeURIComponent(
      typeof studyId == 'string' ?? 'unknown')}`;
    permalink = `${window.location.origin}${pagePath}`;
  }

  useEffect(() => {
    if (studyDetails) {
      open();
    }
  }, [studyDetails, open]);

  if (!studyDetails) {
    return null;
  }

  return (
    <Drawer.Root opened={opened} onClose={close} size="50%" position="right">
      <Drawer.Overlay opacity={0.5} blur={4} />
      <Drawer.Content>
        <Drawer.Header>
          <Button leftIcon={<BackIcon />} onClick={close} variant="outline">
            {' '}
            Back{' '}
          </Button>
          <CopyButton value={permalink}>
            {({ copied, copy }) => (
              <Button color={copied ? 'primary' : 'secondary'} onClick={copy}>
                {copied ? 'Copied Permalink' : 'Permalink'}
              </Button>
            )}
          </CopyButton>
        </Drawer.Header>
        <Drawer.Body>
          <StudyDetailsPanel
            data={studyDetails ?? {}}
            studyConfig={config.detailView}
          />
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
};

export default StudyDetails;
