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
import { Card, Center } from '@mantine/core';
import { ProtectedContent } from '@gen3/frontend';

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
  tierConfiguration,
}: WorkspacesCenterConfiguration) => {
  // get the workspace tier from the core store allowing persistent state across page reloads and navigation changes
  const workspaceTier = useCoreSelector((state: CoreState) =>
    selectWorkspaceTier(state),
  );

  const coreDispatch = useCoreDispatch();

  const handleSelectTier = (tier: string) => {
    coreDispatch(setWorkspaceTier(tier));
  };

  const { data: userData } = useUserAuth(false);

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
        jwt: process.env.JEG_WORKSPACE_DEV_LOCAL_JWT ?? '',
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

  console.log('tierConfiguration', tierConfiguration);

  if (!workspaceTier) {
    return (
      <div className="w-full bg-base-lightest ">
        <TierSelectorLanding
          cards={workspaces}
          onSelectTier={handleSelectTier}
          label={landingPage?.label}
          description={landingPage?.description}
          additionalDescriptions={landingPage?.additionalDescriptions}
          classNames={landingPage?.classNames}
        />
      </div>
    );
  }

  if (workspaceTier === 'free') {
    return (
      <WorkspaceLayout tierConfiguration={tierConfiguration.free}>
        <FreeWorkspace />
      </WorkspaceLayout>
    );
  }

  if (workspaceTier === 'remote') {
    return (
      <ProtectedContent>
        <MicroContainerReduxProvider enabled={true}>
          <WorkspaceLayout tierConfiguration={tierConfiguration.remote}>
            <RemoteWorkspace
              tenantId={authContext?.tenantId || 'default'}
              workspaceId={authContext?.workspaceId || 'workspace-default'}
              userId={authContext?.username || 'anonymous'}
            />
          </WorkspaceLayout>
        </MicroContainerReduxProvider>
      </ProtectedContent>
    );
  }
  return (
    <Card shadow="sm" padding="lg" withBorder>
      <Center>
        Workspaces are not configured correctly or are not supported by this
        instance. Please contact your administrator.
      </Center>
    </Card>
  );
};

export default WorkspaceCenter;
