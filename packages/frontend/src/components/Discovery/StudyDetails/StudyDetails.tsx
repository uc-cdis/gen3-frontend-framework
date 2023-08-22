import { Button, Drawer } from '@mantine/core';
import StudyDetailsPanel from './StudyDetailsPanel';
import React, { useEffect } from "react";
import { useDiscoveryConfigContext } from '../DiscoveryConfigProvider';
import { useDisclosure } from '@mantine/hooks';
import { MdKeyboardDoubleArrowLeft as BackIcon } from 'react-icons/md';

const StudyDetails = () => {
  const { discoveryConfig: config, studyDetails } = useDiscoveryConfigContext();
  const [opened, { open, close }] = useDisclosure(false);


  useEffect(() => {
    if (studyDetails) {
      open();
    }
  }, [studyDetails, open]);

  return (
    <Drawer.Root opened={opened} onClose={close} size="50%" position="right">
      <Drawer.Overlay opacity={0.5} blur={4} />
      <Drawer.Content>
        <Drawer.Header>
          <Button leftIcon={<BackIcon />} onClick={close}>
            {' '}
            Back{' '}
          </Button>
          <Drawer.Title>Drawer title</Drawer.Title>
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
