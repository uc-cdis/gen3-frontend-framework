import React from 'react';
import { formatUptimeInMinutes } from '@gen3/core';
import { Badge, Button, Divider, Stack, Text } from '@mantine/core';
import { KernelRow, KernelSpecEntry } from '../../core/types';
import { useTerminateKernelMutation } from '../../core/jegGatewayApi';

interface RunningKernelPanelProps extends KernelRow {
  onOpenNotebook?: (kernelId: string) => void;
  forceTerminate?: boolean;
  rowSpec?: KernelSpecEntry;
  connections?: number;
}

const ActiveKernelInfoPanel = ({
  kernelId,
  kernelName,
  executionState,
  uptimeMinutes,
  onOpenNotebook,
  forceTerminate = false,
  rowSpec,
  connections = 0,
}: RunningKernelPanelProps) => {
  const [
    terminateKernel,
    {
      isLoading: isTerminatingLoading,
      isError: isTerminatingError,
      error: terminatingError,
    },
  ] = useTerminateKernelMutation();

  const isStaleOrIdle = executionState === 'idle';
  return (
    <div
      key={kernelId}
      className="rounded-sm border-2 border-base-light bg-base-lighter p-2 transition hover:shadow-sm"
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
        <Badge color={isStaleOrIdle ? 'utility.2' : 'utility.6'}>
          <Text size="xs" tt="uppercase" fw={600} c="base-contrast.4"></Text>
          {isStaleOrIdle ? 'Idle' : 'Active'}
        </Badge>
      </div>

      <Stack
        className=" rounded-lg bg-accent-lightest bg-opacity-10 p-4 text-xs text-base-darkest m-2"
        gap={4}
      >
        <div className="flex items-center justify-between">
          <span className="font-semibold text-base-darker">Last Activity:</span>
          <span className="font-bold text-base-darkest">
            {formatUptimeInMinutes(uptimeMinutes)}
          </span>
        </div>
        <Divider color="primary.4" />
        <div className="flex items-center justify-between">
          <span className="font-semibold text-base-darker">GPU:</span>
          <span className="font-bold text-accent-dark">
            {rowSpec?.gpuType || 'none'}
          </span>
        </div>
        <Divider color="primary.4" />
        <div className="flex items-center justify-between">
          <span className="font-semibold text-base-darker">Connections:</span>
          <span className="font-bold text-accent-dark">
            {connections.toLocaleString()}
          </span>
        </div>
        {(rowSpec?.cpu || rowSpec?.memory) && (
          <div className="flex gap-3 border-t border-base-lighter pt-2">
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
      </Stack>

      <div className="mt-5 flex gap-3 m-2">
        {/* TODO: Implement when functionality is available
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
        ----------- */}
        <Button
          aria-label={`${forceTerminate ? 'Force terminate' : 'Terminate'} ${kernelName || 'python3'} kernel`}
          onClick={() => terminateKernel(kernelId)}
          loading={isTerminatingLoading}
          variant="outline"
          color="primary.4"
          fullWidth
        >
          {forceTerminate ? 'Force Terminate' : 'Terminate'}
        </Button>
      </div>
    </div>
  );
};

export default ActiveKernelInfoPanel;
