import React from 'react';
import { Stack, Text } from '@mantine/core';
import { SettingsPanelConfiguration } from '../Tiers/types';
import KernelLifecyclePanel from '../../components/KernelLifecyclePanel';

export const SettingsPanel = ({ showKernels }: SettingsPanelConfiguration) => {
  return (
    <Stack gap="xs" className="p-4">
      <Text size="lg">Settings Panel</Text>
      <KernelLifecyclePanel />
    </Stack>
  );
};

export default SettingsPanel;
