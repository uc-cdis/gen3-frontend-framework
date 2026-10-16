import type { JSX } from 'react';
import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import Discovery from '../../features/Discovery/Discovery';
import type { DiscoveryPageProps } from './types';
import { registerDiscoveryDefaultCellRenderers } from '../../features/Discovery';
import { Center } from '@mantine/core';

registerDiscoveryDefaultCellRenderers();

const DiscoveryPage = ({
  headerProps,
  footerProps,
  headerMetadata,
  discoveryConfig,
}: DiscoveryPageProps): JSX.Element => {
  if (!discoveryConfig) {
    return (
      <Center maw={400} h={100} mx="auto">
        <div>Discovery config is not defined. Page disabled</div>
      </Center>
    );
  }

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Discovery Page', // default headers
        content: 'Discovery Data',
        key: 'gen3-discovery-page',
        ...(headerMetadata ? headerMetadata : {}), // global headers
        ...(discoveryConfig?.headerMetadata // page specific headers
          ? discoveryConfig.headerMetadata
          : {}),
      }}
    >
      <Discovery discoveryConfig={discoveryConfig} />
    </NavPageLayout>
  );
};

export default DiscoveryPage;
