import React from 'react';
import { Button, Group, Text } from '@mantine/core';
import ConnectionStatusBadge from './ConnectionStatusBadge';
import type { GatewayConnectionState } from '../../hooks/useGatewayConnection';
import { InfoRolloverButton } from '@gen3/frontend';
import ActiveKernelsPanel from './ActiveKernelsPanel';
import { useLaunchKernelMutation } from '../../core/jegGatewayApi';
import GatewayConnectionPanel from './GatewayConnectionPanel';
import KernelSelector from './KernelSelector';
import { KernelSelection } from './types';
import { useKernalSpecsQuery } from '../../core/kernelApi';

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

  const {
    data: kernelSpecs,
    isLoading,
    isError,
    error,
  } = useKernalSpecsQuery();

  // get the function to launch kernels
  const [
    launchKernel,
    {
      isLoading: isLaunchingLoading,
      isError: isLaunchingError,
      isSuccess: isLaunchingSuccess,
    },
  ] = useLaunchKernelMutation();

  const handleLaunchKernel = async (kernelName: string) => {
    try {
      // .unwrap() forces the promise to reject on HTTP failure
      const results = await launchKernel(kernelName).unwrap();
      console.log('Launch kernel results:', results);
    } catch (error) {
      console.error('Launch kernel failed!', error);
      // The user can now manually hit "Submit" again to retry safely
    }
  };

  // Billing banner: show when any active kernel has a cost > 0
  const activeKernelSpec = activeKernelName
    ? kernelSpecs?.find((s) => s.name === activeKernelName)
    : null;
  const billingActive = (activeKernelSpec?.costPerHour ?? 0) > 0;

  return (
    <div className="flex flex-col overflow-hidden gap-y-4 p-2">
      <Group gap={4}>
        <Text c="text-base-contrast" size="md" fw={500} className="font-bold">
          Kernel Lifecycle
        </Text>
        <InfoRolloverButton
          label="Launch and manage compute kernels."
          size="sm"
        />
      </Group>
      <GatewayConnectionPanel />
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

      <KernelSelector
        handleLaunchKernel={handleLaunchKernel}
        isLaunchingLoading={isLaunchingLoading}
      />
      <ActiveKernelsPanel />
    </div>
  );
};

export type { LaunchKernelInput };
export default KernelLifecyclePanel;
