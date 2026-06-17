import React from 'react';
import { Stack, Text } from '@mantine/core';
import { SettingsPanelConfiguration } from '../Tiers/types';
import KernelLifecyclePanel from '../../components/KernelLifecyclePanel/KernelLifecyclePanel';
import { PanelHeaderStyle, PanelHeaderTextStyle, PanelStyle } from './styling';

export const SettingsPanel = ({ showKernels }: SettingsPanelConfiguration) => {
  return (
    <Stack gap="sm" className={PanelStyle}>
      <div className={PanelHeaderStyle}>
        <Text className={PanelHeaderTextStyle}>Settings</Text>
      </div>
      <KernelLifecyclePanel />
    </Stack>
  );
};

export default SettingsPanel;
