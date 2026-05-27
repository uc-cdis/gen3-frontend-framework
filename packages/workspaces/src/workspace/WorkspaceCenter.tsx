import React, { useState } from 'react';
import { WorkspaceTier } from '../types';
import TierSelectorLanding from '../components/TierSelectorLanding';
import FreeWorkspace from '../workspace/Tiers/FreeWorkspace';
import { WorkspacesCenterConfiguration } from '../workspace/types';

const WorkspaceCenter = ({
  workspaces,
  landingPage,
}: WorkspacesCenterConfiguration) => {
  const [workspace, setWorkspace] = useState<WorkspaceTier | null>(null);

  if (!workspace) {
    return (
      <TierSelectorLanding
        cards={workspaces}
        onSelectTier={setWorkspace}
        label={landingPage?.label}
        description={landingPage?.description}
        additionalDescriptions={landingPage?.additionalDescriptions}
        classNames={landingPage?.classNames}
      />
    );
  }
  return (
    <>
      {
        {
          free: <FreeWorkspace />,
          local: <div>Local Workspace</div>,
          remote: <div>Remote Workspace</div>,
        }[workspace as string]
      }
    </>
  );
};

export default WorkspaceCenter;
