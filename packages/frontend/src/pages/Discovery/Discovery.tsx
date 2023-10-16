import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import Discovery from '../../features/Discovery/Discovery';
import { DiscoveryPageProps } from './types';
import {
  registerDiscoveryDefaultCellRenderers,
  registerDiscoveryDefaultStudyPreviewRenderers,
} from '../../features/Discovery';

registerDiscoveryDefaultCellRenderers();
registerDiscoveryDefaultStudyPreviewRenderers();

const DiscoveryPage = ({
  headerProps,
  footerProps,
  discoveryConfig,
}: DiscoveryPageProps): JSX.Element => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <Discovery discoveryConfig={discoveryConfig} />
    </NavPageLayout>
  );
};

export default DiscoveryPage;
