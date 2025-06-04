import { Button, CopyButton, Drawer } from '@mantine/core';
import StudyDetailsPanel from './StudyDetailsPanel';
import React, { useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { MdKeyboardDoubleArrowLeft as BackIcon } from 'react-icons/md';
import SinglePageStudyDetailsPanel from './SinglePageStudyDetailsPanel';
import { useStudyContext } from '../StudyProvider';

const StudyDetails = () => {
  // DTODO
  // const { discoveryConfig: config, studyDetails } = useStudyContext();
  const { studyDetails } = useStudyContext();
  const [opened, { open, close }] = useDisclosure(false);
  // DTODO
  // const index = config?.minimalFieldMapping?.uid ?? 'unknown';
  const index = 'unknown';
  let permalink = 'Discovery/notfound';

  if (studyDetails) {
    const studyId = studyDetails[index];
    const pagePath = `/discovery/${encodeURIComponent(
      typeof studyId == 'string' ? 'string' :  'unknown',
    )}`;
    permalink = `/${pagePath}`;
  }

  useEffect(() => {
    if (Object.keys(studyDetails).length > 0) {
      open();
    }
  }, [studyDetails, open]);

  if (!studyDetails) {
    return null;
  }

  // DTODO
  /*
  return (
    <Drawer.Root opened={opened} onClose={close} size="50%" position="right">
      <Drawer.Overlay opacity={0.5} blur={4} />
      <Drawer.Content>
        <Drawer.Header>
          <Button leftSection={<BackIcon />} onClick={close} variant="outline">
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
          {config.detailView ?
          <StudyDetailsPanel
            data={studyDetails ?? {}}
            studyConfig={config.detailView}
          /> : config.simpleDetailsView ?
          <SinglePageStudyDetailsPanel data={studyDetails ?? {}} studyConfig={config.simpleDetailsView} authorization={config.features.authorization} /> :
          <div>Study Details Panel not configured</div>}
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
  */
  return (
    <Drawer.Root opened={opened} onClose={close} size="50%" position="right">
      <Drawer.Overlay opacity={0.5} blur={4} />
      <Drawer.Content>
        <Drawer.Header>
          <Button leftSection={<BackIcon />} onClick={close} variant="outline">
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
          <div>Study Details Panel not configured</div>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
};

export default StudyDetails;
