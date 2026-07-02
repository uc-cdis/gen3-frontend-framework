import React, { useEffect } from 'react';
import { Group, Text } from '@mantine/core';
import type { GatewayConnectionState } from '../../hooks/useGatewayConnection';
import { InfoRolloverButton } from '@gen3/frontend';
import ActiveKernelsPanel from './ActiveKernelsPanel';
import { useLaunchKernelMutation } from '../../core/jegGatewayApi';
import GatewayConnectionPanel from './GatewayConnectionPanel';
import KernelSelector from './KernelSelector';
import { KernelSelection } from './types';
import { useKernalSpecsQuery } from '../../core/kernelApi';
import { useGatewayConnectionStatus } from '../../providers/useGatewayConnectionStatus';
import {
  addJEGActiveKernel,
  selectAllJEGKernels,
  useCoreDispatch,
  useCoreSelector,
} from '@gen3/core';
import { useDeepCompareEffect } from 'use-deep-compare';
import { TextStyle } from './styling';

interface LaunchKernelInput {
  kernelName: string;
}

interface GatewayConnectionStatus {
  status: string;
  message?: string;
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

const MAX_KERNELS_ACTIVE = 2;

const KernelLifecyclePanel = ({
  activeKernelName,
  onRetryConnection,
  onRunStaleReap,
}: KernelLifecyclePanelProps) => {
  const notice = undefined;

  const coreDispatch = useCoreDispatch();

  const numActiveKernels = useCoreSelector(selectAllJEGKernels)?.length || 0;

  const {
    gatewayServiceStatus,
    gatewayStatus,
    gatewayMessage,
    setGatewayStatusAndMessage,
  } = useGatewayConnectionStatus();

  useEffect(() => {
    setGatewayStatusAndMessage('reconnecting');
    // check store to see if last known kernels are still running
  }, []);

  useDeepCompareEffect(() => {
    if (gatewayServiceStatus) {
      setGatewayStatusAndMessage('connected');
    }
  }, [gatewayServiceStatus]);

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
      setGatewayStatusAndMessage('launching');
      // .unwrap() forces the promise to reject on HTTP failure
      const results = await launchKernel(kernelName).unwrap();
      // add to active kernels
      setGatewayStatusAndMessage('connected');

      // add to active kernels so these will persist between page reloads
      coreDispatch(
        addJEGActiveKernel({
          id: results.id,
          name: results.name,
          connections: results.connections,
          lastActivity: results.last_activity,
          executionState: results.execution_state,
        }),
      );
    } catch (error) {
      console.error('Launch kernel failed!', error);
      // The user can now manually hit "Submit" again to retry safely
      setGatewayStatusAndMessage('error', 'Launch kernel failed!');
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
        <Text className={TextStyle}>Kernel Lifecycle</Text>
        <InfoRolloverButton
          label="Launch and manage compute kernels."
          size="sm"
        />
      </Group>
      <GatewayConnectionPanel
        gatewayStatus={gatewayStatus}
        onRetryConnection={onRetryConnection}
        onRunStaleReap={onRunStaleReap}
      />

      {/* Reconnect strip — non-disruptive yellow banner; lifecycle panel stays usable */}
      {gatewayStatus === 'reconnecting' && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 rounded-md border border-accentWarm-light bg-accentWarm-max px-3 py-2 text-xs text-accentWarm-dark"
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
        disabled={numActiveKernels >= MAX_KERNELS_ACTIVE}
      />
      <ActiveKernelsPanel />
    </div>
  );
};

export type { LaunchKernelInput };
export default KernelLifecyclePanel;
