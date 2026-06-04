import React, { useEffect, useState } from 'react';
import { Button, Loader } from '@mantine/core';
import { useMicroContainerContext } from '../providers/MicroContainerProvider';

export interface MicroContainerPanelProps {
  // status: MicroContainerStatus;
  // lastError?: string | null;
  // /** Called when user clicks "Launch Workspace". */
  // onLaunch: () => void;
  // /** Called when user clicks "Stop Workspace". */
  // onTerminate: () => void;
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
const MicroContainerPanel = ({ compact = false }: MicroContainerPanelProps) => {
  const { status, lastError, launch, terminate } = useMicroContainerContext();

  /* ── Elapsed timer for launching state ── */
  const [elapsedSec, setElapsedSec] = useState(0);
  useEffect(() => {
    if (status !== 'launching') {
      setElapsedSec(0);
      return;
    }
    const start = Date.now();
    const t = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [status]);

  /* ── not-running ── */
  if (status === 'not-running' || status === 'unknown') {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 px-6">
        <div className="text-center">
          <h2 className="text-lg font-bold text-base-darkest">
            Launch Workspace
          </h2>
          <p className="mt-2 max-w-sm text-sm text-base-darker">
            Start your personal micro compute environment. Use it for light
            analysis — upgrade to a GPU kernel when you need to run large
            workflows.
          </p>
          <p className="mt-1 text-xs text-base-darker">
            Included with your subscription · typically ready in under 60 s
          </p>
        </div>
        <Button onClick={launch}>Launch Workspace</Button>
        {lastError && (
          <p
            role="alert"
            className="rounded-md border border-primary-light/70 bg-primary-max px-4 py-2 text-xs text-primary"
          >
            {lastError}
          </p>
        )}
      </div>
    );
  }

  /* ── launching ── */
  if (status === 'launching') {
    const mins = Math.floor(elapsedSec / 60);
    const secs = elapsedSec % 60;
    const elapsed = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    return (
      <div
        role="status"
        className="flex flex-col items-center justify-center gap-6 py-12 px-6"
      >
        <Loader size={48} />
        <span className="sr-only">Starting workspace, please wait.</span>
        <div className="text-center">
          <p className="text-base font-bold text-base-darkest">
            Starting your workspace…
          </p>
          <p className="mt-1 text-sm text-base-darker">Elapsed: {elapsed}</p>
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
  if (status === 'error') {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center gap-4 py-12 px-6"
      >
        <div className="rounded-full bg-primary-max p-3">
          <span className="text-2xl text-primary" aria-hidden="true">
            ✕
          </span>
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-base-darkest">
            Workspace failed to start
          </p>
          {lastError && (
            <p className="mt-2 max-w-sm text-xs text-primary">{lastError}</p>
          )}
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
  if (status === 'terminating') {
    return (
      <div
        role="status"
        className="flex flex-col items-center justify-center gap-6 py-12 px-6"
      >
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

  /* ── running (compact badge) ── */
  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-accent-light/60 bg-accent-max px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-accent-dark">
          <span
            className="h-1.5 w-1.5 rounded-full bg-accent-dark"
            aria-hidden="true"
          />
          Workspace running
        </span>
        <Button
          onClick={terminate}
          aria-label="Stop workspace"
          className="text-xs text-base-darker underline hover:text-primary hover:no-underline"
        >
          Stop
        </Button>
      </div>
    );
  }

  // running non-compact — shouldn't normally render, parent shows this alongside iframe
  return null;
};

export default MicroContainerPanel;
