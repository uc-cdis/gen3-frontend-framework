import React, { useCallback, useEffect, useMemo } from 'react';
import { Drawer } from '@mantine/core';
import StudyDetailsPanel from './StudyDetailsPanel';
import { useDisclosure } from '@mantine/hooks';
import SinglePageStudyDetailsPanel from './SinglePageStudyDetailsPanel';
import { useStudyContext } from '../StudyProvider';
import { StudyDetailView, StudyPageConfig } from '../types';
import { DataAuthorization } from '../../../utils';
import StudyDetailsHeaderButtons from './StudyDetailsHeaderButtons';
import { useRouter } from 'next/router';

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
  const router = useRouter();
  const { studyDetails, setStudyDetails } = useStudyContext();
  const [opened, { open, close }] = useDisclosure(false);
  const defaultPermaLinkValue = 'Discovery/notfound';
  // const [permalink, setPermalink] = useState(defaultPermaLinkValue);

  const hasStudyDetails = Object.keys(studyDetails).length > 0;
  const studyId = studyDetails?.[index];

  console.log('studyDetails', studyDetails);

  const handleClose = useCallback(() => {
    // close();
    setStudyDetails({});
  }, [setStudyDetails]);

  const link = useMemo(() => {
    if (studyId) {
      const origin = window?.location?.href ?? defaultPermaLinkValue;
      const studyPath = `${origin}/${encodeURIComponent(studyId as string)}`;
      // router.push(studyPath, undefined, { shallow: true });
      return studyPath;
    } else {
      return defaultPermaLinkValue;
    }
  }, [router.asPath, studyId]);

  // `opened` intentionally omitted: the effect should only fire when
  // hasStudyDetails changes, not when the drawer opens/closes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (studyId && !opened) {
      open();
    } else {
      close();
    }
  }, [studyId, open, close]);

  console.log('permalink', link);

  return (
    <Drawer.Root
      opened={opened}
      onClose={handleClose}
      size="50%"
      position="right"
    >
      <Drawer.Overlay opacity={0.5} blur={4} />{' '}
      {hasStudyDetails && (
        <Drawer.Content className="pl-2">
          <Drawer.Header>
            <StudyDetailsHeaderButtons
              onClose={handleClose}
              permalink={link}
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
