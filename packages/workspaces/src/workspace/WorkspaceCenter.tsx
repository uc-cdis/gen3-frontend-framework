import React, { useState } from 'react';
import { WorkspaceTier } from '../types';
import TierSelectorLanding from '@/components/TierSelectorLanding';
import { WorkspacesCenterConfiguration } from '@/pages/WorkspacesCenter/types';

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
    <div>
      {
        {
          free: <div>Free Workspace</div>,
          local: <div>Local Workspace</div>,
          remote: <div>Remote Workspace</div>,
        }[workspace as string]
      }
    </div>
  );
};

export default WorkspaceCenter;
