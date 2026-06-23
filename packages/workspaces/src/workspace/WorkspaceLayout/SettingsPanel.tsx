import React from 'react';
import { Stack, Text } from '@mantine/core';
import { SettingsPanelConfiguration } from '../tiers/types';
import KernelLifecyclePanel from '../../components/KernelLifecyclePanel/KernelLifecyclePanel';
import { PanelHeaderStyle, PanelHeaderTextStyle, PanelStyle } from './styling';
import UpgradeActionsPanel from '../../components/UpgradeActionsPanel';
import { selectWorkspaceTier, useCoreSelector } from '@gen3/core';
import { WorkspaceTier } from '../../types';

export const SettingsPanel = ({ showKernels }: SettingsPanelConfiguration) => {
  const currentTier = useCoreSelector(selectWorkspaceTier);

  return (
    <Stack gap="sm" className={PanelStyle}>
      <div className={PanelHeaderStyle}>
        <Text className={PanelHeaderTextStyle}>Settings</Text>
      </div>
      {showKernels && <KernelLifecyclePanel />}
      <UpgradeActionsPanel
        currentTier={
          currentTier !== null ? (currentTier as WorkspaceTier) : 'free'
        }
      />
    </Stack>
  );
};

export default SettingsPanel;
