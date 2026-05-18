import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router'; // Or 'next/navigation' if using App Router
import { Drawer } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useStudyContext } from '../StudyProvider';
import { StudyDetailView, StudyPageConfig } from '../types';
import { DataAuthorization } from '../../../utils';
import StudyDetailsHeaderButtons from './StudyDetailsHeaderButtons';
import StudyDetailsPanel from './StudyDetailsPanel';
import SinglePageStudyDetailsPanel from './SinglePageStudyDetailsPanel';
import { toString } from 'lodash';

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
  const hasStudyDetails = Object.keys(studyDetails).length > 0;

  const origin = window.location.origin;
  const defaultPath = 'Discovery';
  const defaultPermaLinkValue = `${origin}/${defaultPath}/notfound`;
  const [permalink, setPermalink] = useState(defaultPermaLinkValue);

  useEffect(() => {
    const studyId = toString(studyDetails[index]);
    /*     const pushUrl = (path: string) =>
      typeof window !== 'undefined' && window.history.pushState(null, '', path); */

    const pushUrl = (path: string) =>
      router.push(path, undefined, { shallow: true });

    if (studyId) {
      if (opened) {
        pushUrl(`/Discovery/${encodeURI(studyId)}`);
        setPermalink(`${origin}/${defaultPath}/${encodeURI(studyId)}`);
      } else {
        pushUrl('/Discovery');
        setPermalink(defaultPermaLinkValue);
      }
    }
    if (opened === false) {
      // if drawer has been shut, reset study details
      setStudyDetails({});
    }
  }, [opened]);

  useEffect(() => {
    if (hasStudyDetails) {
      open();
    }
  }, [studyDetails, open]);

  /*
  const permalink = useMemo(() => {
    if (studyId && typeof window !== 'undefined') {
      const origin = window.location.origin;
      return `${origin}${defaultPath}/${encodeURIComponent(studyId as string)}`;
    }
    return `${origin}${defaultPath}/notfound`;
  }, [studyId]);

  // Sync Browser URL with Drawer state
  useEffect(() => {
    if (opened && studyId) {
      const studyPath = `${defaultPath}/${encodeURIComponent(studyId as string)}`;
      if (router.asPath !== studyPath) {
        router.push(studyPath, undefined, { shallow: true });
      }
    }
    if (!opened && hasStudyDetails === false) {
      router.push(defaultPath, undefined, { shallow: true });
    }
  }, [opened, studyId]);

  useEffect(() => {
    if (hasStudyDetails) {
      open();
    }
  }, [hasStudyDetails, open]);

  const handleClose = () => {
    close();
    setStudyDetails({});
  };
*/

  return (
    <Drawer.Root opened={opened} onClose={close} size="50%" position="right">
      <Drawer.Overlay opacity={0.5} blur={4} />
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
              <StudyDetailsPanel data={studyDetails} studyConfig={detailView} />
            ) : (
              <SinglePageStudyDetailsPanel
                data={studyDetails}
                studyConfig={simpleDetailsView!}
                authorization={authz}
              />
            )}
          </Drawer.Body>
        </Drawer.Content>
      )}
    </Drawer.Root>
  );
};

export default StudyDetails;
