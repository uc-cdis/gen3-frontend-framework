import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // Or 'next/navigation' if using App Router
import { Drawer } from '@mantine/core';
import StudyDetailsPanel from './StudyDetailsPanel';
import { useDisclosure } from '@mantine/hooks';
import SinglePageStudyDetailsPanel from './SinglePageStudyDetailsPanel';
import { useStudyContext } from '../StudyProvider';
import { StudyDetailView, StudyPageConfig } from '../types';
import { DataAuthorization } from '../../../utils';
import StudyDetailsHeaderButtons from './StudyDetailsHeaderButtons';
import { toString } from 'lodash';
import { useDiscoveryContext } from '../../Discovery/DiscoveryProvider';
import { CoreState, selectUserAuthStatus, useCoreSelector } from '@gen3/core';

const StudyDetails = () => {
  const { discoveryConfig: config } = useDiscoveryContext();
  const index = config?.minimalFieldMapping?.uid ?? 'unknown';
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
  const pushUrl = (path: string) =>
    router.push(path, undefined, { shallow: true });
  const studyId = toString(studyDetails[index]);

  useEffect(() => {
    if (studyId) {
      if (opened) {
        pushUrl(`/${defaultPath}/${encodeURI(studyId)}`);
        setPermalink(`${origin}/${defaultPath}/${encodeURI(studyId)}`);
      } else {
        pushUrl(`/${defaultPath}`);
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

  const userStatus = useCoreSelector((state: CoreState) =>
    selectUserAuthStatus(state),
  );

  return (
    <Drawer.Root opened={opened} onClose={close} size="50%" position="right">
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
