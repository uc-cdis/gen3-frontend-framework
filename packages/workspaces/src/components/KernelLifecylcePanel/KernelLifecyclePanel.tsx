import React, { useEffect, useState } from 'react';
import { Button, Group, Select, Text } from '@mantine/core';
import ConnectionStatusBadge from '../ConnectionStatusBadge';
import type { GatewayConnectionState } from '../../hooks/useGatewayConnection';
import { useKernelsAndSpecsQuery } from '../../core/hooks';
import { InfoRolloverButton } from '@gen3/frontend';
import { formatUptimeInMinutes } from '@gen3/core';

// const JEGGatewayMessage = (gateway) => {
//   if (!jegEnabled) return null;
//   if (gateway.connectionState === 'unavailable') return null;
//   if (gateway.specs.loading || gateway.kernelList.loading) return null;
//   if (gateway.activeKernel) {
//     return 'GPU kernel running — open the kernel picker (in JupyterLab above) to connect notebooks to it.';
//   }
//   return 'Select a GPU kernel type and click Launch. Once it starts, JupyterLab will detect it — open the kernel picker to connect.';
// };

interface LaunchKernelInput {
  kernelName: string;
}

interface KernelSelection {
  kernelName?: string;
  kernelId?: string;
}

export interface KernelLifecyclePanelProps {
  notice?: string | null;
  launching?: boolean;
  /** Current gateway connection state — drives status badge and reconnect strip. */
  connectionState?: GatewayConnectionState;
  /** The currently active kernel (for billing banner). */
  activeKernelName?: string | null;
  /** How long the micro-container has been online, in minutes. Shown per-kernel as "Container Uptime". */
  containerUptimeMinutes?: number | null;
  /** Called when user clicks Retry in the error badge. */
  onRetryConnection?: () => void;
  onRunStaleReap?: () => void;
  onLaunchKernel?: (input: LaunchKernelInput) => void;
  onOpenNotebook?: (kernelId: string) => void;
  onTerminateKernel?: (kernelId: string) => void;
  onKernelSelectionChange?: (selection: KernelSelection) => void;
  idleKillDays?: number;
  maxKernelAgeDays?: number;
  /**
   * When true, the terminate button on each kernel row is labelled "Force Terminate"
   * and is always visible regardless of kernel execution state.
   * Use this in JEG mode where GPU kernels can get stuck and must be force-evicted.
   */
  forceTerminate?: boolean;
}

const KernelLifecyclePanel = ({
  launching = false,
  connectionState,
  activeKernelName,
  containerUptimeMinutes,
  onRetryConnection,
  onRunStaleReap,
  onLaunchKernel,
  onOpenNotebook,
  onTerminateKernel,
  onKernelSelectionChange,
  forceTerminate = false,
}: KernelLifecyclePanelProps) => {
  const notice = undefined;

  const { kernels, kernelSpecs, isLoading, isError, error } =
    useKernelsAndSpecsQuery();

  const displayRows = kernels.map((k) => ({
    kernelId: k.id,
    kernelName: k.name,
    executionState: k.executionState,
  }));

  const [selectedKernelName, setSelectedKernelName] = useState<string>(
    kernelSpecs?.[0]?.name || 'python3',
  );

  // When specs arrive after first render (async load), reset selectedKernelName
  // if the current value is no longer a valid spec name.
  useEffect(() => {
    if (kernelSpecs?.length > 0) {
      setSelectedKernelName((prev) => {
        if (!kernelSpecs?.find((s) => s.name === prev)) {
          return kernelSpecs?.[0]?.name || 'python3';
        }
        return prev;
      });
    }
  }, [kernelSpecs]);

  // Billing banner: show when any active kernel has a cost > 0
  const selectedSpec = kernelSpecs?.find((s) => s.name === selectedKernelName);
  const selectedSpecCost = selectedSpec?.costPerHour ?? 0;
  const resourceTags = selectedSpec
    ? ((
        [
          selectedSpec.cpu && {
            label: 'CPU',
            value: selectedSpec.cpu,
            gpu: false,
          },
          selectedSpec.memory && {
            label: 'RAM',
            value: selectedSpec.memory,
            gpu: false,
          },
          selectedSpec.gpuType && {
            label: 'GPU',
            value: selectedSpec.gpuType,
            gpu: true,
          },
        ] as const
      ).filter(Boolean) as { label: string; value: string; gpu: boolean }[])
    : [];
  const activeKernelSpec = activeKernelName
    ? kernelSpecs?.find((s) => s.name === activeKernelName)
    : null;
  const billingActive = (activeKernelSpec?.costPerHour ?? 0) > 0;

  useEffect(() => {
    onKernelSelectionChange?.({
      kernelName: selectedKernelName || undefined,
    });
  }, [selectedKernelName, onKernelSelectionChange]);

  const canLaunch = Boolean(onLaunchKernel);

  return (
    <div className="flex flex-col overflow-hidden p-2">
      <Group>
        <Text c="text-base-contrast" size="md" fw={500} className="font-bold">
          Kernel Lifecycle
        </Text>
        <InfoRolloverButton label="Launch and manage compute kernels." />
      </Group>
      <div className="flex items-center gap-2">
        {connectionState && (
          <ConnectionStatusBadge
            state={connectionState}
            onRetry={onRetryConnection}
          />
        )}
        <Button
          onClick={onRunStaleReap}
          disabled={!onRunStaleReap}
          variant="default"
        >
          Run Stale Reap
        </Button>
      </div>

      {/* Reconnect strip — non-disruptive yellow banner; lifecycle panel stays usable */}
      {connectionState === 'reconnecting' && (
        <div
          role="status"
          aria-live="polite"
          className="mt-3 flex items-center gap-2 rounded-md border border-accentWarm-light bg-accentWarm-max px-3 py-2 text-xs text-accentWarm-dark"
        >
          <span aria-hidden="true">⟳</span>
          Connection to kernel interrupted — reconnecting automatically. Your
          work is safe.
        </div>
      )}

      {/* Billing banner — persistent warning when a paid kernel is active */}
      {billingActive && activeKernelSpec && (
        <div
          role="status"
          aria-live="polite"
          className="mt-3 flex items-center justify-between gap-2 rounded-md border border-accentWarm bg-accentWarm-max px-3 py-2 text-xs font-semibold text-accentWarm-darkest"
        >
          <span>
            GPU kernel running — billing active ($
            {activeKernelSpec.costPerHour?.toFixed(2)}/hr). Terminate to stop
            charges.
          </span>
        </div>
      )}

      {notice && (
        <p
          role="status"
          className="mt-4 rounded-md border border-base-lighter bg-base-lightest bg-opacity-50 px-3 py-2 text-sm text-base-darker"
        >
          {notice}
        </p>
      )}

      <div className="mt-5 rounded-xl border border-base-lighter bg-base-max p-5">
        <Group>
          <p className="text-xs font-bold uppercase tracking-wider text-base-darker">
            Launch Kernel
          </p>
          <InfoRolloverButton label="Launch and manage compute kernels." />
        </Group>
        <div className="mt-4 space-y-4">
          <div>
            {/*<label htmlFor="klp-kernel-spec" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-base-dark">Kernel Spec</label>*/}
            <Select
              id="klp-kernel-spec"
              value={selectedKernelName}
              onChange={(value) => setSelectedKernelName(value as string)}
              data={
                kernelSpecs?.length === 0
                  ? [{ value: 'python3', label: 'python3' }]
                  : kernelSpecs?.map((spec) => {
                      const parts: string[] = [];
                      if (spec.cpu) parts.push(`${spec.cpu} CPU`);
                      if (spec.memory) parts.push(spec.memory);
                      if (spec.gpuType) parts.push(spec.gpuType);
                      const resources =
                        parts.length > 0 ? ` · ${parts.join(' · ')}` : '';
                      const cost =
                        spec.costPerHour != null && spec.costPerHour > 0
                          ? ` — $${spec.costPerHour.toFixed(2)}/hr`
                          : spec.nodeType === 'micro'
                            ? ' — included'
                            : '';
                      return {
                        value: spec.name,
                        label: `${spec.displayName}${resources}${cost}`,
                      };
                    })
              }
              label="Kernels"
            />
            {selectedSpecCost > 0 && (
              <p className="mt-1 text-xs text-accentWarm-dark">
                GPU kernels auto-terminate after 4h idle. Max 1 GPU kernel per
                user.
              </p>
            )}
          </div>

          {/* Resource summary for the selected spec */}
          {resourceTags.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs">
              {resourceTags.map(({ label, value, gpu }) => (
                <span
                  key={label}
                  className={`rounded-full px-2.5 py-1 font-semibold ${
                    gpu
                      ? 'bg-accent-max text-accent-dark'
                      : 'bg-base-lightest text-base-darkest'
                  }`}
                >
                  {label}: {value}
                </span>
              ))}
            </div>
          )}

          <Button
            onClick={() =>
              onLaunchKernel?.({
                kernelName: selectedKernelName || 'python3',
              })
            }
            disabled={launching || !canLaunch}
            className="w-full"
          >
            {launching ? 'Working...' : 'Launch Kernel'}
          </Button>
        </div>
      </div>

      {isLoading && (
        <p role="status" className="mt-4 text-sm text-base-darker">
          Loading kernels...
        </p>
      )}
      {isError && (
        <p role="alert" className="mt-4 text-sm text-primary">
          {error ? "Couldn't load kernels." : 'Unknown error.'}
        </p>
      )}

      {!isLoading && !isError && displayRows.length === 0 && (
        <p className="mt-4 text-sm text-base-darker">No active kernels.</p>
      )}

      {!isLoading && !isError && displayRows.length > 0 && (
        <div role="list" className="mt-4 space-y-4">
          {displayRows.map((row) => {
            const state = (row.executionState || '').toLowerCase();
            const isStaleOrIdle = state === 'idle';
            // TODO: figure out where this is set
            //  ||
            //   row.staleState === 'warning' ||
            //  row.staleState === 'kill';
            const rowSpec = kernelSpecs?.find((s) => s.name === row.kernelName);

            return (
              <div
                role="listitem"
                key={row.kernelId}
                className={`min-w-0 rounded-xl border border-base-lighter bg-white p-6 shadow-sm transition hover:shadow-md ${
                  isStaleOrIdle
                    ? 'border-l-4 border-l-accentWarm'
                    : 'border-l-4 border-l-accent-dark'
                }`}
              >
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-base-darkest">
                      {row.kernelName || 'python3'}
                    </p>
                    <p className="mt-1 text-xs font-medium text-base-darker">
                      State:{' '}
                      <span className="uppercase">
                        {row.executionState || 'unknown'}
                      </span>
                    </p>
                    {/*  TODO: See where this is set
                      row.staleState === 'warning' && (
                      <p className="mt-1 text-xs text-accentWarm-dark">
                        Idle warning: inactive for about{' '}
                        {Math.floor(row.idleDays || 0)} day(s).
                      </p>
                    ) */}
                    {/*
                    TODO: See where this is set
                    row.staleState === 'kill' && (
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

                <div className="mt-4 rounded-lg border border-base-lightest bg-base-lightest bg-opacity-50 p-4 text-xs text-base-darkest">
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
                          <strong className="text-base-darkest">
                            {rowSpec.cpu}
                          </strong>
                        </span>
                      )}
                      {rowSpec?.memory && (
                        <span className="text-base-darker">
                          RAM:{' '}
                          <strong className="text-base-darkest">
                            {rowSpec.memory}
                          </strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 flex gap-3">
                  <Button
                    aria-label={`Open notebook for ${row.kernelName || 'python3'} kernel`}
                    onClick={() => onOpenNotebook?.(row.kernelId)}
                    disabled={!onOpenNotebook}
                    color="accent"
                    variant="light"
                    className="flex-1 border-accent-light/60"
                  >
                    Open Notebook
                  </Button>
                  <Button
                    aria-label={`${forceTerminate ? 'Force terminate' : 'Terminate'} ${row.kernelName || 'python3'} kernel`}
                    onClick={() => onTerminateKernel?.(row.kernelId)}
                    disabled={!onTerminateKernel}
                    variant="light"
                    className="flex-1 border-primary-light/70"
                  >
                    {forceTerminate ? 'Force Terminate' : 'Terminate'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export type { LaunchKernelInput };
export default KernelLifecyclePanel;
