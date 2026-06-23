import React, { useMemo } from 'react';
import TierSelectorLanding from '../components/TierSelectorLanding';
import FreeWorkspace from './tiers/FreeWorkspace';
import RemoteWorkspace from './tiers/RemoteComputeWorkspace';
import { WorkspacesCenterConfiguration } from '../workspace/types';
import WorkspaceLayout from '../workspace/WorkspaceLayout/WorkspaceLayout';
import {
  CoreState,
  selectWorkspaceTier,
  setWorkspaceTier,
  useCoreDispatch,
  useCoreSelector,
  useUserAuth,
} from '@gen3/core';
import { MicroContainerReduxProvider } from '../providers/MicroContainerReduxProvider';

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
  // get the workspace tier from the core store allowing persistent state across page reloads and navigation changes
  const workspaceTier = useCoreSelector((state: CoreState) =>
    selectWorkspaceTier(state),
  );

  const coreDispatch = useCoreDispatch();

  const handleSelectTier = (tier: string) => {
    coreDispatch(setWorkspaceTier(tier));
  };

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
        onSelectTier={handleSelectTier}
        label={landingPage?.label}
        description={landingPage?.description}
        additionalDescriptions={landingPage?.additionalDescriptions}
        classNames={landingPage?.classNames}
      />
    );
  }

  if (workspaceTier === 'free') {
    return (
      <WorkspaceLayout>
        <FreeWorkspace />
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout>
      {
        {
          free: <FreeWorkspace />,
          local: <div>Local Workspace</div>,
          remote: (
            <MicroContainerReduxProvider enabled={true}>
              <RemoteWorkspace
                tenantId={authContext?.tenantId || 'default'}
                workspaceId={authContext?.workspaceId || 'workspace-default'}
                userId={authContext?.username || 'anonymous'}
              />
            </MicroContainerReduxProvider>
          ),
        }[workspaceTier as string]
      }
    </WorkspaceLayout>
  );
};

export default WorkspaceCenter;
