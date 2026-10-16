import React, { useMemo } from 'react';
import { DiscoveryIndexConfig } from '../Discovery/types';
import { ProjectCenterConfig, ProjectCenterIndexConfig } from './types';
import ProjectCenterIndexPanel from './ProjectCenterIndexPanel';
import MessagePanel from '../../components/MessagePanel';
import DiscoveryProvider from '../Discovery/DiscoveryProvider';

const extractLabel = (c: ProjectCenterIndexConfig, idx: number) =>
  c.label ?? c.features?.pageTitle?.text ?? `Index ${idx.toString()}`;

export interface ProjectCenterProps {
  discoveryConfig: ProjectCenterConfig;
}

const ProjectCenter = ({ discoveryConfig }: ProjectCenterProps) => {
  const menuItems = useMemo(() => {
    return discoveryConfig.metadataConfig.map((n, idx) => {
      return { value: idx.toString(), label: extractLabel(n, idx) };
    });
  }, [discoveryConfig.metadataConfig]);

  if (menuItems.length === 0) {
    return <MessagePanel message="No discovery configuration" />;
  }

  return (
    <DiscoveryProvider
      discoveryIndexConfig={
        discoveryConfig.metadataConfig[0] as DiscoveryIndexConfig
      }
    >
      <ProjectCenterIndexPanel indexSelector={null} />
    </DiscoveryProvider>
  );
};

export default ProjectCenter;
