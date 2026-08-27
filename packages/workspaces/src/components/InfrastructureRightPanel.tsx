import React from 'react';
import KernelLifecyclePanel, {
  type KernelLifecyclePanelProps,
} from './KernelLifecyclePanel/KernelLifecyclePanel';
import UpgradeActionsPanel, {
  type UpgradeActionsPanelProps,
} from './UpgradeActionsPanel';

export interface InfrastructureRightPanelProps {
  kernelPanel: KernelLifecyclePanelProps;
  upgradePanel: UpgradeActionsPanelProps;
  showKernelPanel?: boolean;
  /**
   * When false, hides the UpgradeActionsPanel. Set to false once a user is already
   * in the remote-tier micro-container experience — upgrade messaging is irrelevant.
   * Default: true.
   */
  showUpgradePanel?: boolean;
}

const InfrastructureRightPanel = ({
  kernelPanel,
  upgradePanel,
  showKernelPanel = true,
  showUpgradePanel = true,
}: InfrastructureRightPanelProps) => {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {showKernelPanel && <KernelLifecyclePanel {...kernelPanel} />}
        {showUpgradePanel && <UpgradeActionsPanel {...upgradePanel} />}
      </div>
    </div>
  );
};

export default InfrastructureRightPanel;
