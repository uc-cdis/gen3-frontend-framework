import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Drawer } from '@mantine/core';
import StudyDetailsPanel from './StudyDetailsPanel';
import { useDisclosure } from '@mantine/hooks';
import SinglePageStudyDetailsPanel from './SinglePageStudyDetailsPanel';
import { useStudyContext } from '../StudyProvider';
import StudyDetailsHeaderButtons from './StudyDetailsHeaderButtons';
import { toString } from 'lodash';
import { useDiscoveryContext } from '../../Discovery/DiscoveryProvider';

const StudyDetails = () => {
  const { discoveryConfig: config } = useDiscoveryContext();
  const index = config.minimalFieldMapping.uid ?? 'unknown';
  const detailView = config.detailView;
  const simpleDetailsView = config.simpleDetailsView;
  const authz = config.features.authorization;
  const { studyDetails, setStudyDetails } = useStudyContext();
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const hasStudyDetails = Object.keys(studyDetails).length > 0;
  const origin = window.location.origin;
  const defaultPath = 'Discovery';
  const defaultPermaLinkValue = `${origin}/${defaultPath}/notfound`;
  const [permalink, setPermalink] = useState(defaultPermaLinkValue);
  const pushUrl = useCallback(
    (path: string) => router.push(path, undefined, { shallow: true }),
    [router],
  );
  const studyId = toString(studyDetails[index]);
  const shouldRouteToStudy =
    (detailView?.routeToStudyURL || simpleDetailsView?.routeToStudyURL) ??
    false;

  useEffect(() => {
    if (studyId) {
      if (opened) {
        if (shouldRouteToStudy) {
          void pushUrl(`/${defaultPath}/${encodeURI(studyId)}`);
        }
        setPermalink(`${origin}/${defaultPath}/${encodeURI(studyId)}`);
      } else {
        if (shouldRouteToStudy) {
          void pushUrl(`/${defaultPath}`);
        }
        setPermalink(defaultPermaLinkValue);
      }
    }
  }, [
    opened,
    studyId,
    origin,
    pushUrl,
    shouldRouteToStudy,
    defaultPermaLinkValue,
  ]);

  const handleClose = () => {
    close();
  };

  useEffect(() => {
    if (hasStudyDetails) {
      open();
    }
  }, [hasStudyDetails, open]);

  return (
    <Drawer.Root
      opened={opened}
      onClose={handleClose}
      size="50%"
      position="right"
      // reset study details only after the close transition finishes,
      // so the content stays mounted while the drawer slides out
      transitionProps={{ onExited: () => setStudyDetails({}) }}
    >
      <Drawer.Overlay opacity={0.5} blur={4} />
      {hasStudyDetails && (
        <Drawer.Content className="pl-2">
          <Drawer.Header>
            <StudyDetailsHeaderButtons onClose={close} permalink={permalink} />
          </Drawer.Header>
          <Drawer.Body>
            {detailView ? (
              <StudyDetailsPanel data={studyDetails} studyConfig={detailView} />
            ) : simpleDetailsView ? (
              <SinglePageStudyDetailsPanel
                data={studyDetails}
                studyConfig={simpleDetailsView!}
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
