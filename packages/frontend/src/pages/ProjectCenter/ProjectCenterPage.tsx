import React, { JSX } from 'react';
import { NavPageLayout } from '../../features/Navigation';
import ProjectCenter from '../../features/ProjectCenter/ProjectCenter';
import { ProjectCenterPageProps } from './types';
import { registerDiscoveryDefaultCellRenderers } from '../../features/Discovery';
import { Center } from '@mantine/core';

registerDiscoveryDefaultCellRenderers();

const ProjectCenterPage = ({
  headerProps,
  footerProps,
  discoveryConfig,
}: ProjectCenterPageProps): JSX.Element => {
  if (discoveryConfig === undefined) {
    return (
      <Center maw={400} h={100} mx="auto">
        <div>ProjectCenter config is not defined. Page disabled</div>
      </Center>
    );
  }

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Project Center Page',
        content: 'Project Center Data',
        key: 'gen3-project-center-page',
        ...(discoveryConfig?.headerMetadata
          ? discoveryConfig.headerMetadata
          : {}),
      }}
    >
      <ProjectCenter discoveryConfig={discoveryConfig} />
    </NavPageLayout>
  );
};

export default ProjectCenterPage;
