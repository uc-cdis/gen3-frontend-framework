import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Loader } from '@mantine/core';
import { useInterval } from '@mantine/hooks';
import {
  selectJEGActiveWorkspaceStatus,
  selectJEGRequestedWorkspaceStatusTimestamp,
  setJEGActiveWorkspaceStatus,
  useCoreDispatch,
  useCoreSelector,
  WorkspaceStatus,
} from '@gen3/core';
import { useMicroContainerReduxContext } from '../providers/MicroContainerReduxProvider';
import { Icon } from '@iconify-icon/react';

const icon = <Icon icon="gen3:error-outline" size={24} />;

export interface MicroContainerPanelProps {
  /** Whether the panel should render in compact mode (status === 'running'). */
  compact?: boolean;
}

/**
 * Micro container lifecycle UI — five exclusive states.
 *
 * not-running  → "Launch Workspace" button + cost context. Nothing else.
 * launching    → Spinner + elapsed timer + "Starting your workspace…" + Cancel.
 * running      → Compact status badge (renders at top of right panel).
 * terminating  → Spinner + "Stopping workspace…". No actions until pod is gone.
 * error        → Error message + Terminate / Retry buttons.
 *
 * The iframe and KernelLifecyclePanel are rendered by the PARENT only when
 * status === 'running' && useJupyterReady.ready === true.
 */

const PanelStyle =
  'h-full w-full flex flex-col items-center justify-start gap-6 px-6 mt-20';

const MicroContainerReduxPanel = ({
  compact = false,
}: MicroContainerPanelProps) => {
  const { launch, terminate } = useMicroContainerReduxContext();

  const status = useCoreSelector(selectJEGActiveWorkspaceStatus);
  const requestedStatusTimestamp: number = useCoreSelector(
    selectJEGRequestedWorkspaceStatusTimestamp,
  );

  const coreDispatch = useCoreDispatch();

  const resetStatus = useCallback(() => {
    coreDispatch(setJEGActiveWorkspaceStatus(WorkspaceStatus.NotFound));
  }, [coreDispatch]);

  /* ── Elapsed timer for launching state ── */
  const [elapsedSec, setElapsedSec] = useState(0);

  const interval = useInterval(() => {
    const elapsed = Math.floor(
      (Date.now() - (requestedStatusTimestamp as number)) / 1000,
    );
    setElapsedSec(elapsed);
  }, 1000);

  useEffect(() => {
    if (status === WorkspaceStatus.Launching) {
      interval.start();
    } else {
      setElapsedSec(0);
      interval.stop();
    }
    return interval.stop;
  }, [status, interval]);

  /* ── Auto-reset after 15 s in launch-error state ── */
  useEffect(() => {
    if (status !== WorkspaceStatus.LaunchError) return;
    const t = setTimeout(() => resetStatus(), 6_000);
    return () => clearTimeout(t);
  }, [status, resetStatus]);

  if (status === WorkspaceStatus.StatusError) {
    return (
      <div className={PanelStyle}>
        <Alert
          variant="light"
          color="accentWarm.4"
          title="Status Error"
          icon={icon}
        >
          Unable to get the status of your workspace. Please try again later.
        </Alert>
      </div>
    );
  }

  /* ── not-running ── */
  if (status === WorkspaceStatus.NotFound) {
    return (
      <div className={PanelStyle}>
        <div className="text-center">
          <Icon
            icon="gen3:run"
            width={100}
            height={100}
            className="text-primary"
          />

          <p className="mt-2 max-w-sm text-sm text-base-darker">
            Start your personal micro compute environment. Use it for light
            analysis — upgrade to a GPU kernel when you need to run large
            workflows.
          </p>
          <p className="mt-1 text-xs text-base-darker">
            Included with your subscription · typically ready in under 60s
          </p>
        </div>
        <Button variant="outline" onClick={launch}>
          Launch Workspace
        </Button>
      </div>
    );
  }

  /* ── launching ── */
  if (status === WorkspaceStatus.Launching) {
    return (
      <div role="status" className={PanelStyle}>
        <Loader size={48} />
        <span className="sr-only">Starting workspace, please wait.</span>
        <div className="text-center">
          <p className="text-base font-bold text-base-darkest">
            Starting your workspace…
          </p>
          <p className="mt-1 text-sm text-base-darker">
            Elapsed: {elapsedSec} {elapsedSec === 1 ? 'second' : 'seconds'}
          </p>
          <p className="mt-1 text-xs text-base-dark">
            Usually takes 30–90 seconds on a cold start.
          </p>
        </div>
        <Button onClick={terminate} variant="outline">
          Cancel
        </Button>
      </div>
    );
  }

  /* ── error ── */
  if (status === WorkspaceStatus.LaunchError) {
    return (
      <div role="alert" className={PanelStyle}>
        <Alert
          variant="light"
          color="accentWarm.4"
          title="Status Error"
          icon={icon}
        >
          Workspace failed to start.
        </Alert>
        <div className="flex items-center gap-3">
          <Button onClick={resetStatus} variant="default">
            Reset
          </Button>
        </div>
      </div>
    );
  }

  /* ── error ── */
  if (status === WorkspaceStatus.Stopped) {
    return (
      <div role="alert" className={PanelStyle}>
        <div className="text-center">
          <p className="text-base font-bold text-base-darkest">
            Workspace stopped
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={terminate} variant="outline">
            Terminate
          </Button>
          <Button onClick={launch} variant="default">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  /* ── terminating ── */
  if (status === WorkspaceStatus.Terminating) {
    return (
      <div role="status" className={PanelStyle}>
        <Loader size={48} />
        <span className="sr-only">Stopping workspace, please wait.</span>
        <div className="text-center">
          <p className="text-base font-bold text-base-darkest">
            Stopping your workspace…
          </p>
          <p className="mt-1 text-xs text-base-darker">
            Waiting for the container to shut down. This usually takes under a
            minute.
          </p>
        </div>
      </div>
    );
  }

  // none of the above so render nothing
  return null;
};

export default MicroContainerReduxPanel;
