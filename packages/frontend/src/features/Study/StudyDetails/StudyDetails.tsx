import React, { useEffect, useState } from 'react';
import { Drawer } from '@mantine/core';
import StudyDetailsPanel from './StudyDetailsPanel';
import { useDisclosure } from '@mantine/hooks';
import SinglePageStudyDetailsPanel from './SinglePageStudyDetailsPanel';
import { useStudyContext } from '../StudyProvider';
import { StudyDetailView, StudyPageConfig } from '../types';
import { DataAuthorization } from '../../../utils';
import StudyDetailsHeaderButtons from './StudyDetailsHeaderButtons';
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
  const { studyDetails, setStudyDetails } = useStudyContext();
  const [opened, { open, close }] = useDisclosure(false);
  const defaultPermaLinkValue = 'Discovery/notfound';
  const [permalink, setPermalink] = useState(defaultPermaLinkValue);
  const hasStudyDetails = Object.keys(studyDetails).length > 0;

  useEffect(() => {
    const studyId = toString(studyDetails[index]);
    const pushUrl = (path: string) =>
      typeof window !== 'undefined' && window.history.pushState(null, '', path);
    if (studyId) {
      if (opened) {
        pushUrl(`/Discovery/${encodeURI(studyId)}`);
        setPermalink(window?.location?.href ?? defaultPermaLinkValue);
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

  return (
    <Drawer.Root opened={opened} onClose={close} size="50%" position="right">
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
