import React, { useState } from 'react';
import { WorkspaceTier } from '../types';
import TierSelectorLanding from '../components/TierSelectorLanding';
import FreeWorkspace from '../workspace/Tiers/FreeWorkspace';
import { WorkspacesCenterConfiguration } from '../workspace/types';
import WorkspaceLayout from '../workspace/WorkspaceLayout/WorkspaceLayout';

const WorkspaceCenter = ({
  workspaces,
  landingPage,
}: WorkspacesCenterConfiguration) => {
  const [workspace, setWorkspaceTier] = useState<WorkspaceTier | null>(null);

  if (!workspace) {
    return (
      <TierSelectorLanding
        cards={workspaces}
        onSelectTier={setWorkspaceTier}
        label={landingPage?.label}
        description={landingPage?.description}
        additionalDescriptions={landingPage?.additionalDescriptions}
        classNames={landingPage?.classNames}
      />
    );
  }
  return (
    <WorkspaceLayout setTier={setWorkspaceTier}>
      {
        {
          free: <FreeWorkspace />,
          local: <div>Local Workspace</div>,
          remote: <div>Remote Workspace</div>,
        }[workspace as string]
      }
    </WorkspaceLayout>
  );
};

export default WorkspaceCenter;
