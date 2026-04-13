import React, { useEffect } from 'react';
import { Drawer } from '@mantine/core';
import StudyDetailsPanel from './StudyDetailsPanel';
import { useDisclosure } from '@mantine/hooks';
import SinglePageStudyDetailsPanel from './SinglePageStudyDetailsPanel';
import { useStudyContext } from '../StudyProvider';
import { StudyDetailView, StudyPageConfig } from '../types';
import { DataAuthorization } from '../../../utils';
import StudyDetailsHeaderButtons from './StudyDetailsHeaderButtons';

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
      <Drawer.Content className="pl-2">
        <Drawer.Header>
          <StudyDetailsHeaderButtons studyIndex={index} />
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
