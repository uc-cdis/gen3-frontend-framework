import React from 'react';
import type { DiscoveryIndexConfig } from '../Discovery/types';
import type { ProjectCenterConfig, ProjectCenterIndexConfig } from './types';
import ProjectCenterIndexPanel from './ProjectCenterIndexPanel';
import MessagePanel from '../../components/MessagePanel';
import DiscoveryProvider from '../Discovery/DiscoveryProvider';

const extractLabel = (c: ProjectCenterIndexConfig, idx: number) =>
  c.label ?? c.features?.pageTitle?.text ?? `Index ${idx.toString()}`;

export interface ProjectCenterProps {
  projectCenterConfig: ProjectCenterConfig;
}

const ProjectCenter = ({ projectCenterConfig }: ProjectCenterProps) => {
  if (!projectCenterConfig?.metadataConfig) {
    return <MessagePanel message="No ProjectCenter configuration" />;
  }

  return (
    <DiscoveryProvider
      discoveryIndexConfig={
        projectCenterConfig.metadataConfig[0] as DiscoveryIndexConfig
      }
    >
      <ProjectCenterIndexPanel indexSelector={null} />
    </DiscoveryProvider>
  );
};

export default ProjectCenter;
