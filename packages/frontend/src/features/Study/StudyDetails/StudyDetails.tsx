import React, { useEffect, useMemo } from 'react';
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
  const defaultPermaLinkValue = 'Discovery/notfound';
  const hasStudyDetails = Object.keys(studyDetails).length > 0;

  const permalink = useMemo(() => {
    const studyId = studyDetails?.[index];
    if (studyId) {
      const origin = window?.location?.href ?? defaultPermaLinkValue;
      const studyPath = `${origin}/${encodeURIComponent(studyId as string)}`;
      // router.push(studyPath, undefined, { shallow: true });
      return studyPath;
    } else {
      return defaultPermaLinkValue;
    }
  }, [index, studyDetails]);

  // `opened` intentionally omitted: the effect should only fire when
  // hasStudyDetails changes, not when the drawer opens/closes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (Object.keys(studyDetails).length > 0) {
      open();
    }
  }, [studyDetails, open]);

  return (
    <Drawer.Root
      opened={opened}
      onClose={() => {
        close();
      }}
      size="50%"
      position="right"
    >
      <Drawer.Overlay opacity={0.5} blur={4} />{' '}
      {hasStudyDetails && (
        <Drawer.Content className="pl-2">
          <Drawer.Header>
            <StudyDetailsHeaderButtons
              onClose={close}
              permalink={permalink}
              showSubmitButton={simpleDetailsView?.showSubmitButton}
            />
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
      )}
    </Drawer.Root>
  );
};

export default StudyDetails;
