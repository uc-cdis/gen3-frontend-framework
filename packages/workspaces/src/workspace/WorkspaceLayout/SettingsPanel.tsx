import React, { useCallback } from 'react';
import { SettingsPanelConfiguration } from '../tiers/types';
import KernelLifecyclePanel from '../../components/KernelLifecyclePanel/KernelLifecyclePanel';
import { PanelStyle } from './styling';
import UpgradeActionsPanel from '../../components/UpgradeActionsPanel';
import {
  selectWorkspaceTier,
  setWorkspaceTier,
  useCoreDispatch,
  useCoreSelector,
} from '@gen3/core';
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
  width = 380,
}: SettingsPanelProps) => {
  const currentTier = useCoreSelector(selectWorkspaceTier);
  const coreDispatch = useCoreDispatch();

  const onUpgradeToRemote = useCallback(() => {
    coreDispatch(setWorkspaceTier('remote' as WorkspaceTier));
  }, [coreDispatch]);

  return (
    <HorizontalAccordion
      label="Settings"
      expanded={expanded}
      setExpanded={setExpanded}
      rightSide
      expandedWidth={width}
    >
      <div className={`${PanelStyle} overflow-y-scroll`}>
        {showKernels && <KernelLifecyclePanel />}
        <UpgradeActionsPanel
          currentTier={
            currentTier !== null ? (currentTier as WorkspaceTier) : 'free'
          }
          onUpgradeToRemote={onUpgradeToRemote}
        />
      </div>
    </HorizontalAccordion>
  );
};

export default SettingsPanel;
