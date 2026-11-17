import React, { type ReactElement } from 'react';
import {
  NavPageLayout,
  type NavPageLayoutProps,
} from '../../../features/Navigation';
import type { DiscoveryConfig } from '../../../features/Discovery';
import { registerDiscoveryDefaultCellRenderers } from '../../../features/Discovery';
import { DiscoveryConfigEditor } from '../../../features/admin/Discovery';

registerDiscoveryDefaultCellRenderers();

export interface DiscoveryConfigPageProps extends NavPageLayoutProps {
  discoveryConfig: DiscoveryConfig;
  commonsName: string;
}

const DiscoveryConfigPage = ({
  headerProps,
  footerProps,
  discoveryConfig,
  commonsName,
}: DiscoveryConfigPageProps): ReactElement => (
  <NavPageLayout
    {...{ headerProps, footerProps }}
    headerMetadata={{
      title: 'Gen3 Discovery Config Editor',
      content: 'Discovery config editor',
      key: 'gen3-discovery-config-editor',
    }}
  >
    <DiscoveryConfigEditor
      initialConfig={discoveryConfig}
      commonsName={commonsName}
    />
  </NavPageLayout>
);

export default DiscoveryConfigPage;
