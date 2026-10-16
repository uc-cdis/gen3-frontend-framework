import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Alert, Loader, LoadingOverlay, Text, Tabs, ThemeIcon } from '@mantine/core';
import { useDeepCompareEffect } from 'use-deep-compare';
import StudyDetailsPanel from './StudyDetailsPanel';
import { accessibleFieldName, AccessLevel } from '../../../utils';
import { useDiscoveryContext } from '../../Discovery/DiscoveryProvider';
import { useStudyContext } from '../../Study/StudyProvider';
import StudyDetails from '../../Study/StudyDetails/StudyDetails';
import { DataRequestStatus } from '../../Discovery/types';
import { ProjectCenterIndexConfig } from '../types';

import {
  LuLock as LockedIcon,
  LuLockOpen as UnlockedIcon,
} from 'react-icons/lu';

interface ProjectCenterDisplayProps {
  data: Array<Record<string, any>>;
  studyIdFromWindow?: string;
  dataRequestStatus: DataRequestStatus;
  setSelection: (selection: Array<string>) => void;
}
const ProjectCenterDisplay = ({
  data,
  studyIdFromWindow,
  dataRequestStatus,
  setSelection,
}: ProjectCenterDisplayProps) => {
  const { discoveryConfig } = useDiscoveryContext();
  const config = discoveryConfig as unknown as ProjectCenterIndexConfig;
  const { setStudyDetails } = useStudyContext();
  const [rowSelection] = useState<Record<string, boolean>>({});
  // the unique id of each study, used as the tab value and in the ?tab= URL param
  const uidField = config.minimalFieldMapping.uid;
  const getUid = (item: Record<string, any>): string => item[uidField];

  useEffect(() => {
    if (!studyIdFromWindow || !data) return;
    if (Array.isArray(data)) {
      const foundStudy = data.find(
        (item) => item[uidField] === studyIdFromWindow,
      );
      if (foundStudy) setStudyDetails(foundStudy);
    }
  }, [studyIdFromWindow, data]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const tabNotFound =
    !!tabParam && !data?.some((item) => getUid(item) === tabParam);
  // default to the first study only when no tab is given in the URL
  const activeTab = tabParam ?? (data?.[0] ? getUid(data[0]) : undefined);

  const noStudies =
    !dataRequestStatus.isLoading &&
    !dataRequestStatus.isError &&
    (!Array.isArray(data) || data.length === 0);

  // When the result set changes (e.g. a new search) select the top study.
  // The first non-empty result set is skipped so a ?tab= deep link is respected.
  const resultIds = Array.isArray(data)
    ? data.map(getUid).join(',')
    : '';
  const previousResultIds = useRef<string | null>(null);
  useEffect(() => {
    if (!resultIds) return;
    const previous = previousResultIds.current;
    previousResultIds.current = resultIds;
    if (previous === null || previous === resultIds) return;
    router.replace(`?tab=${resultIds.split(',')[0]}`, { scroll: false });
  }, [resultIds]);

  const tabCard = ({
    value,
    study_id,
    full_name,
    tag,
    accessable
  } : {
    value: string,
    study_id: string,
    full_name: string,
    tag: string,
    accessable: boolean
  }) => {
    return (
      <Tabs.Tab value={value} key={value}>
        <div className="flex">
          <div className="">
            <ThemeIcon color="base" variant="light" size={36}>
              {
                accessable ? (
                  <UnlockedIcon aria-label="Unlocked"/>
                ) : (
                  <LockedIcon aria-label="Locked"/>
                )
              }
            </ThemeIcon>
          </div>
          <div className="text-left pl-2 text-balance">
            <Text fz="xs">{study_id}</Text>
            <Text fz="sm" className="font-bold">{full_name}</Text>
            <Text fz="xs" c="dimmed">{tag}</Text>
          </div>
        </div>
      </Tabs.Tab>
    ); 
  }
  const createTabs = () => {
    return (
      <Tabs
        value={tabNotFound ? null : activeTab}
        onChange={(value) => router.push(`?tab=${value}`, { scroll: false })}
        unstyled
        keepMounted={false}
        classNames={{
          root: "flex",
          list: "flex flex-col border-r py-5 w-[260px] bg-base-lighter flex-none",
          panel: "grow bg-white",
          tab: "p-2 border-l-4 border-l-base-lighter border-y aria-selected:bg-white aria-selected:border-primary hover:bg-base-lightest hover:border-primary-lightest",
          tabLabel: "",
          tabSection: ""
        }}
      >
        <Tabs.List>
          {data.map(({
            [uidField]: uid,
            study_id,
            full_name,
            tags,
            [accessibleFieldName]: accessableLevel
          })=> tabCard({
            value: uid,
            study_id: study_id, 
            full_name: full_name, 
            tag: tags?.[0]?.name,
            accessable: accessableLevel === AccessLevel.ACCESSIBLE
          }))}
        </Tabs.List>
        {tabNotFound && (
          <div className="grow bg-white p-5">
            <Alert
              color="red"
              title="Project not found"
              classNames={{
                title: 'text-utility-error',
              }}
            >
              {`No project matches "${tabParam}" in the URL. Select a project from the list.`}
            </Alert>
          </div>
        )}
        {data.map((item) => (
          <StudyDetailsPanel
            key={getUid(item)}
            value={getUid(item)}
            data={item}
            studyConfig={config.detailsView}
            authorization={config.features.authorization}
          />
        ))}
      </Tabs>
    ); 
  }

  useDeepCompareEffect(() => {
    //fetch data based on row selection state
    setSelection(rowSelection ? Object.keys(rowSelection) : []);
  }, [rowSelection, setSelection]);

  if (dataRequestStatus.isLoading) {
    return (
      <div className="flex w-full py-24 relative justify-center">
        <Loader variant="dots" />
      </div>
    );
  }
  if (dataRequestStatus.isError) {
    return (
      <div className="flex w-full py-24 h-100 relative justify-center">
        <Text size={'xl'}>Error loading Project Center data</Text>
      </div>
    );
  }
  if (noStudies) {
    return (
      <div className="flex w-full py-24 justify-center">
        <Text size="xl">No Projects found. Try changing your search or filters.</Text>
      </div>
    );
  }
  return (
    <React.Fragment>
      <StudyDetails />
      <div className="grow w-full inline-block">
        <LoadingOverlay visible={dataRequestStatus.isLoading} />
        {createTabs()}
      </div>
    </React.Fragment>
  );
};

export default ProjectCenterDisplay;
