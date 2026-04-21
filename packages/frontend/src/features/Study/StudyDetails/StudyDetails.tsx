import { Button, CopyButton, Drawer } from '@mantine/core';
import StudyDetailsPanel from './StudyDetailsPanel';
import React, { useEffect, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { MdKeyboardDoubleArrowLeft as BackIcon } from 'react-icons/md';
import SinglePageStudyDetailsPanel from './SinglePageStudyDetailsPanel';
import { useStudyContext } from '../StudyProvider';
import { StudyDetailView, StudyPageConfig } from '../types';
import { DataAuthorization } from '../../../utils';
import { useRouter } from 'next/router';
import { toString } from 'lodash';
import { JSONObject } from '@gen3/core';

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
  // let permalink = 'Discovery/notfound';
  const defaultPermaLinkValue = 'Discovery/notfound';
  const [permalink, setPermalink] = useState(defaultPermaLinkValue);
  const router = useRouter();
  /*
  const updateStudyDetailsDependencies = () => {
    if (studyDetails) {
      const studyId = studyDetails[index];
      const pagePath = `/discovery/${encodeURIComponent(
        typeof studyId == 'string' ? 'string' : 'unknown',
      )}`;
      permalink = `/${pagePath}`;
    }
  }; */

  useEffect(() => {
    if (Object.keys(studyDetails).length > 0) {
      open();
    }
  }, [studyDetails, open]);

  useEffect(() => {
    const studyId = toString(studyDetails[index]);
    if (studyId) {
      if (opened) {
        if (typeof window !== 'undefined') {
          window.history.pushState(
            null,
            '',
            `/Discovery/${encodeURI(studyId)}`,
          );
        }
        setPermalink(window.location.href);
      } else {
        setPermalink(defaultPermaLinkValue);
        if (typeof window !== 'undefined') {
          window.history.pushState(null, '', `/Discovery`);
        }
      }
    }
    if (opened === false) {
      // drawer just closed
      console.log('drawer closed (effect)');
      // trigger event here
      setStudyDetails({});
    }
  }, [opened]);

  if (!studyDetails) {
    return null;
  }

  return (
    <Drawer.Root opened={opened} onClose={close} size="50%" position="right">
      <Drawer.Overlay opacity={0.5} blur={4} />
      <Drawer.Content>
        <Drawer.Header>
          <Button leftSection={<BackIcon />} onClick={close} variant="outline">
            Back
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
