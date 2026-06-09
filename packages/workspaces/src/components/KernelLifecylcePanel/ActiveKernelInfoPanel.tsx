import React from 'react';
import { formatUptimeInMinutes } from '@gen3/core';
import { Button } from '@mantine/core';
import { KernelRow, KernelSpecEntry } from '../../core/types';
import { useTerminateKernelMutation } from '../../core/jegGatewayApi';

interface RunningKernelPanelProps extends KernelRow {
  onOpenNotebook?: (kernelId: string) => void;
  forceTerminate?: boolean;
  containerUptimeMinutes?: number;
  rowSpec?: KernelSpecEntry;
}

const ActiveKernelInfoPanel = ({
  kernelId,
  executionState,
  kernelName,
  onOpenNotebook,
  forceTerminate = false,
  containerUptimeMinutes,
  rowSpec,
}: RunningKernelPanelProps) => {
  const state = (executionState || '').toLowerCase();
  const [
    terminateKernel,
    {
      isLoading: isTerminatingLoading,
      isError: isTerminatingError,
      error: terminatingError,
    },
  ] = useTerminateKernelMutation();

  const isStaleOrIdle = state === 'idle';
  return (
    <div
      key={kernelId}
      className={`min-w-0 rounded-xl border border-base-lighter bg-base-max p-6 transition hover:shadow-md ${
        isStaleOrIdle
          ? 'border-l-4 border-l-accentWarm'
          : 'border-l-4 border-l-accentCool'
      }`}
    >
      <div className="flex min-w-0 items-start justify-between gap-2 m-2">
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-base-darkest">
            {kernelName || 'python3'}
          </p>
          <p className="mt-1 text-xs font-medium text-base-darker">
            State:{' '}
            <span className="uppercase">{executionState || 'unknown'}</span>
          </p>
          {/*  TODO: See where this is set
                      staleState === 'warning' && (
                      <p className="mt-1 text-xs text-accentWarm-dark">
                        Idle warning: inactive for about{' '}
                        {Math.floor(idleDays || 0)} day(s).
                      </p>
                    ) */}
          {/*
                    TODO: See where this is set
                    staleState === 'kill' && (
                      <p className="mt-1 text-xs text-primary">
                        Stale kill policy applies; autosave + terminate pending.
                      </p>
                    )*/}
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
            isStaleOrIdle
              ? 'bg-accentWarm-max text-accentWarm-dark'
              : 'bg-accent-max text-accent-dark'
          }`}
        >
          {isStaleOrIdle ? 'Stale/Idle' : 'Active'}
        </span>
      </div>

      <div className="rounded-lg bg-base-lightest bg-opacity-50 p-4 text-xs text-base-darkest m-2">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-semibold text-base-darker">
            Container Uptime:
          </span>
          <span className="font-bold text-base-darkest">
            {formatUptimeInMinutes(containerUptimeMinutes)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-base-lighter pt-2">
          <span className="font-semibold text-base-darker">GPU:</span>
          <span className="font-bold text-accent-dark">
            {rowSpec?.gpuType || 'none'}
          </span>
        </div>
        {(rowSpec?.cpu || rowSpec?.memory) && (
          <div className="mt-2 flex gap-3 border-t border-base-lighter pt-2">
            {rowSpec?.cpu && (
              <span className="text-base-darker">
                CPU:{' '}
                <strong className="text-base-darkest">{rowSpec.cpu}</strong>
              </span>
            )}
            {rowSpec?.memory && (
              <span className="text-base-darker">
                RAM:{' '}
                <strong className="text-base-darkest">{rowSpec.memory}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 flex gap-3 m-2">
        <Button
          aria-label={`Open notebook for ${kernelName || 'python3'} kernel`}
          onClick={() => onOpenNotebook?.(kernelId)}
          disabled={!onOpenNotebook}
          color="accent"
          variant="light"
          className="flex-1 border-accent-light/60"
        >
          Open Notebook
        </Button>
        <Button
          aria-label={`${forceTerminate ? 'Force terminate' : 'Terminate'} ${kernelName || 'python3'} kernel`}
          onClick={() => terminateKernel(kernelId)}
          loading={isTerminatingLoading}
          variant="light"
          className="flex-1 border-primary-light"
        >
          {forceTerminate ? 'Force Terminate' : 'Terminate'}
        </Button>
      </div>
    </div>
  );
};

export default ActiveKernelInfoPanel;
