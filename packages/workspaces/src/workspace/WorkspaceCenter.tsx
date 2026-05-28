import React, { useState } from 'react';
import { WorkspaceTier } from '../types';
import TierSelectorLanding from '../components/TierSelectorLanding';
import FreeWorkspace from '../workspace/Tiers/FreeWorkspace';
import { WorkspacesCenterConfiguration } from '../workspace/types';
import WorkspaceLayout from '../workspace/WorkspaceLayout/WorkspaceLayout';
import WorkspaceCenterContext from './WorkspaceCenterContext';

const WorkspaceCenter = ({
  workspaces,
  landingPage,
}: WorkspacesCenterConfiguration) => {
  const [workspaceTier, setWorkspaceTier] = useState<WorkspaceTier | null>(
    null,
  );

  if (!workspaceTier) {
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
    <WorkspaceCenterContext.Provider
      value={{ workspaceTier, setWorkspaceTier }}
    >
      <WorkspaceLayout>
        {
          {
            free: <FreeWorkspace />,
            local: <div>Local Workspace</div>,
            remote: <div>Remote Workspace</div>,
          }[workspaceTier as string]
        }
      </WorkspaceLayout>
    </WorkspaceCenterContext.Provider>
  );
};

export default WorkspaceCenter;
