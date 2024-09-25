import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import Discovery from '../../features/Discovery/Discovery';
import { DiscoveryPageProps } from './types';
import {
  registerDiscoveryDefaultCellRenderers,
  registerDiscoveryDefaultStudyPreviewRenderers,
} from '../../features/Discovery';
import { Center } from '@mantine/core';

registerDiscoveryDefaultCellRenderers();
registerDiscoveryDefaultStudyPreviewRenderers();

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

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerData={{
        title: 'Gen3 Discovery Page',
        content: 'Discovery Data',
        key: 'gen3-discovery-page',
      }}
    >
      <Discovery discoveryConfig={discoveryConfig} />
    </NavPageLayout>
  );
};

export default DiscoveryPage;
