import React from 'react';
import { DiscoveryIndexConfig } from '../Discovery/types';
import { ProjectCenterConfig, ProjectCenterIndexConfig } from './types';
import ProjectCenterIndexPanel from './ProjectCenterIndexPanel';
import MessagePanel from '../../components/MessagePanel';

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
    <ProjectCenterIndexPanel
      indexSelector={null}
      configuration={
        projectCenterConfig.metadataConfig[0] as DiscoveryIndexConfig
      }
    />
  );
};

export default ProjectCenter;
