import React from 'react';
import { Stack } from '@mantine/core';
import { SettingsPanelConfiguration } from '../tiers/types';
import KernelLifecyclePanel from '../../components/KernelLifecyclePanel/KernelLifecyclePanel';
import { PanelStyle } from './styling';
import UpgradeActionsPanel from '../../components/UpgradeActionsPanel';
import { selectWorkspaceTier, useCoreSelector } from '@gen3/core';
import { WorkspaceTier } from '../../types';
import HorizontalAccordion from '../../components/HorizontalAccordian';

interface SettingsPanelProps extends SettingsPanelConfiguration {
  expanded: boolean;
  setExpanded: (_arg: boolean) => void;
}

export const SettingsPanel = ({
  showKernels,
  expanded,
  setExpanded,
}: SettingsPanelProps) => {
  const currentTier = useCoreSelector(selectWorkspaceTier);

  return (
    <HorizontalAccordion
      label="Settings"
      expanded={expanded}
      setExpanded={setExpanded}
      rightSide
    >
      <Stack gap="sm" className={PanelStyle}>
        {showKernels && <KernelLifecyclePanel />}
        <UpgradeActionsPanel
          currentTier={
            currentTier !== null ? (currentTier as WorkspaceTier) : 'free'
          }
        />
      </Stack>
    </HorizontalAccordion>
  );
};

export default SettingsPanel;
