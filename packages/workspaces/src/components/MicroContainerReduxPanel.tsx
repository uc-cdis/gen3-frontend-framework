import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Alert, Button, Loader, Select, ComboboxItem } from '@mantine/core';
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
import { useHatcheryOptionsQuery } from '../core/hatcheryApi';
import { Icon } from '@iconify-icon/react';
import { MdExpandMore } from 'react-icons/md';

const icon = <Icon icon="gen3:error-outline" size={24} />;

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

const MicroContainerReduxPanel = ({enableOptions = false}) => {
  const { launch, terminate, containerHash } = useMicroContainerReduxContext();
  const { data: hatcheryOptions, isLoading: isHatcheryOptionsLoading, isError: isHatcheryOptionsError} = useHatcheryOptionsQuery();
  const [ workspaceOptionSelected, setWorkspaceOptionSelected ] = useState<ComboboxItem | null>(null);

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

  const simpleLaunchWorkspaceBtn = (
    <Button variant="outline" color="accent.3" onClick={()=>launch()}>
      Launch Workspace
    </Button>
  );

  const launchWorkspaceBtn = useMemo(()=>{
    if (isHatcheryOptionsLoading) {
      return (<Loader size={24} />);
    }
    if (isHatcheryOptionsError) {
      return (
          <Alert
            variant="light"
            color="accentWarm.4"
            title="Options API Error"
            icon={icon}
          >
            Failed to Fetch Options
          </Alert>
        );
    }
    if ( hatcheryOptions && hatcheryOptions.length > 1) {

      const workspaceOptionLaunch = () => {
        if (workspaceOptionSelected?.value) {
          launch(workspaceOptionSelected.value);
        }
      };
      const hatcheryOptionForSelect = hatcheryOptions.map((obj)=>({
        label: obj.name,
        value: obj.id
      }));
      return (
        <div className='flex'>
          <Select
            rightSection={
              <MdExpandMore
                className="text-accent"
                size="1.5em"
                aria-hidden
              />
            }
            withCheckIcon={false}
            data={hatcheryOptionForSelect}
            value={workspaceOptionSelected ? workspaceOptionSelected.value : null}
            placeholder='-- Select workspace type --'
            onChange={(_value, option) => setWorkspaceOptionSelected(option)}
            classNames={{input: 'rounded-r-none'}}
            color="accent.3"
          />
          <Button 
            onClick={workspaceOptionLaunch}
            className='rounded-l-none w-64 disabled:bg-accent-lighter disabled:text-accent-contrast'
            disabled={!workspaceOptionSelected?.value}
            color="accent.3"
          >
            Launch Workspace
          </Button>
        </div>
      );
    }
    return simpleLaunchWorkspaceBtn;
  }, [isHatcheryOptionsLoading, workspaceOptionSelected, containerHash]);

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
            width={60}
            height={60}
            className="text-accent"
          />

          <p className="mt-2 max-w-lg text-sm text-base-darker">
            Start your personal micro compute environment. Use it for light analysis, upgrade to a GPU kernel when you need to run large workflows.
          </p>
        </div>
        { enableOptions ? launchWorkspaceBtn: simpleLaunchWorkspaceBtn }
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
          <Button onClick={()=>launch()} variant="default">
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
