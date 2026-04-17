import React, { JSX, useMemo } from 'react';
import { NavPageLayout } from '../../features/Navigation';
import Discovery from '../../features/Discovery/Discovery';
import { DiscoveryPageProps } from './types';
import { registerDiscoveryDefaultCellRenderers } from '../../features/Discovery';
import { Center } from '@mantine/core';

registerDiscoveryDefaultCellRenderers();

// Helper: extract the segment after /Discovery/
function getStudyIdFromPath(pathname?: string): string | null {
  if (!pathname) return null;
  const match = pathname.match(/^\/Discovery\/([^\/?#]+)/i);
  return match ? match[1] : null;
}

const DiscoveryPage = ({
  headerProps,
  footerProps,
  discoveryConfig,
}: DiscoveryPageProps): JSX.Element => {
  if (discoveryConfig === undefined) {
    return (
      <Center maw={400} h={100} mx="auto">
        <div>Discovery config is not defined. Page disabled</div>
      </Center>
    );
  }

  const studyId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getStudyIdFromPath(window.location.pathname);
  }, []);

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Discovery Page',
        content: 'Discovery Data',
        key: 'gen3-discovery-page',
        ...(discoveryConfig?.headerMetadata
          ? discoveryConfig.headerMetadata
          : {}),
      }}
    >
      <Discovery
        discoveryConfig={discoveryConfig}
        studyId={studyId as string}
      />
    </NavPageLayout>
  );
};

export default DiscoveryPage;
