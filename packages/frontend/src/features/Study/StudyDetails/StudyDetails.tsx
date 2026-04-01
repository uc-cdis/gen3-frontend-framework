import { Button, CopyButton, Drawer } from '@mantine/core';
import StudyDetailsPanel from './StudyDetailsPanel';
import React, { useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { MdKeyboardDoubleArrowLeft as BackIcon } from 'react-icons/md';
import SinglePageStudyDetailsPanel from './SinglePageStudyDetailsPanel';
import { useStudyContext } from '../StudyProvider';
import { StudyDetailView, StudyPageConfig } from '../types';
import { DataAuthorization } from '../../../utils';

const StudyDetails = ({
  index,
  detailView,
  simpleDetailsView,
  authz,
}: {
  index: string;
  detailView: StudyDetailView;
  simpleDetailsView?: StudyPageConfig;
  authz: DataAuthorization;
}) => {
  const { studyDetails } = useStudyContext();
  const [opened, { open, close }] = useDisclosure(false);
  let permalink = 'Discovery/notfound';

  if (studyDetails) {
    const studyId = studyDetails[index];
    const pagePath = `/discovery/${encodeURIComponent(
      typeof studyId == 'string' ? 'string' : 'unknown',
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
          {detailView ? (
            <StudyDetailsPanel
              data={studyDetails ?? {}}
              studyConfig={detailView}
            />
          ) : simpleDetailsView ? (
            <SinglePageStudyDetailsPanel
              data={studyDetails ?? {}}
              studyConfig={simpleDetailsView}
              authorization={authz}
            />
          ) : (
            <div>Study Details Panel not configured</div>
          )}
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
};

export default StudyDetails;
