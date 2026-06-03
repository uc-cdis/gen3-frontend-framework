import React, { useMemo, useState } from 'react';
import { WorkspaceTier } from '../types';
import TierSelectorLanding from '../components/TierSelectorLanding';
import FreeWorkspace from '../workspace/Tiers/FreeWorkspace';
import RemoteWorkspace from '../workspace/Tiers/RemoteWorkspace';
import { WorkspacesCenterConfiguration } from '../workspace/types';
import WorkspaceLayout from '../workspace/WorkspaceLayout/WorkspaceLayout';
import WorkspaceCenterContext from './WorkspaceCenterContext';
import { useUserAuth } from '@gen3/core';

export type WorkspaceAuthContext = {
  username?: string;
  rbac?: string[];
  abac?: Record<string, unknown>;
  tenantId?: string;
  workspaceId?: string;
};

const WorkspaceCenter = ({
  workspaces,
  landingPage,
}: WorkspacesCenterConfiguration) => {
  const [workspaceTier, setWorkspaceTier] = useState<WorkspaceTier | null>(
    null,
  );

  const {
    data: userData,
    isFetching,
    isUninitialized,
    loginStatus,
  } = useUserAuth(false);

  const isDevelopment = process.env.NODE_ENV !== 'production';

  const username =
    userData?.username ||
    userData?.preferred_username ||
    userData?.email ||
    undefined;

  const authContext = useMemo<WorkspaceAuthContext>(() => {
    if (isDevelopment) {
      return {
        username: username || 'dev-local-user',
        jwt: 'dev-local-token',
        rbac: userData?.authz ? Object.keys(userData.authz) : [],
        abac: { devBypass: true },
      };
    }

    return {
      username,
      rbac: userData?.authz ? Object.keys(userData.authz) : [],
      abac: {},
    };
  }, [isDevelopment, userData, username]);

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
            remote: (
              <RemoteWorkspace
                tenantId={authContext?.tenantId || 'default'}
                workspaceId={authContext?.workspaceId || 'workspace-default'}
                userId={authContext?.username || 'anonymous'}
              />
            ),
          }[workspaceTier as string]
        }
      </WorkspaceLayout>
    </WorkspaceCenterContext.Provider>
  );
};

export default WorkspaceCenter;
