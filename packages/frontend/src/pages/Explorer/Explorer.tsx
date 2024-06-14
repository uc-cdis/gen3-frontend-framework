import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import { CohortBuilder } from '../../features/CohortBuilder';
import { ExplorerPageProps } from './types';
import { Center } from '@mantine/core';
import {
  registerExplorerDefaultCellRenderers,
  registerCohortBuilderDefaultPreviewRenderers,
} from '../../features/CohortBuilder';

registerExplorerDefaultCellRenderers();
registerCohortBuilderDefaultPreviewRenderers();

const ExplorerPage = ({
  headerProps,
  footerProps,
  explorerConfig,
}: ExplorerPageProps): JSX.Element => {
  if (explorerConfig === undefined) {
    return (
      <Center maw={400} h={100} mx="auto">
        <div>Explorer config is not defined. Page disabled</div>
      </Center>
    );
  }

  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <CohortBuilder explorerConfig={explorerConfig} />
    </NavPageLayout>
  );
};

export default ExplorerPage;
