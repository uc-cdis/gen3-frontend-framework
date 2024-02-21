import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import { CohortBuilder } from '../../features/CohortBuilder';
import { ExplorerPageProps } from './types';

import { registerExplorerDefaultCellRenderers } from '../../features/CohortBuilder';

registerExplorerDefaultCellRenderers();

const ExplorerPage = ({
  headerProps,
  footerProps,
  explorerConfig,
}: ExplorerPageProps): JSX.Element => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <CohortBuilder explorerConfig={explorerConfig} />
    </NavPageLayout>
  );
};

export default ExplorerPage;
