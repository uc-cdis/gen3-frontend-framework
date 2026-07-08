import React, { useEffect, useState } from 'react';
import { Button, Group, LoadingOverlay, Select, Text } from '@mantine/core';
import { InfoRolloverButton } from '@gen3/frontend';
import { useKernalSpecsQuery } from '../../core/kernelApi';
import { KernelSelection } from './types';
import { PanelStyle, TextStyle } from './styling';

interface KernelSelectorProps {
  handleLaunchKernel: (kernelName: string) => void;
  isLaunchingLoading: boolean;
  onKernelSelectionChange?: (selection: KernelSelection) => void;
  disabled?: boolean;
}

const KernelSelector = ({
  handleLaunchKernel,
  isLaunchingLoading,
  onKernelSelectionChange,
  disabled = false,
}: KernelSelectorProps) => {
  const {
    data: kernelSpecs,
    isLoading,
    isError,
    error,
  } = useKernalSpecsQuery();

  const [selectedKernelName, setSelectedKernelName] = useState<string>(
    kernelSpecs?.[0]?.name || 'python3',
  );

  // When specs arrive after first render (async load), reset selectedKernelName
  // if the current value is no longer a valid spec name.
  useEffect(() => {
    if (kernelSpecs && kernelSpecs?.length > 0) {
      setSelectedKernelName((prev) => {
        if (!kernelSpecs?.find((s) => s.name === prev)) {
          return kernelSpecs?.[0]?.name || 'python3';
        }
        return prev;
      });
    }
  }, [kernelSpecs]);

  // set the global kernel selection
  useEffect(() => {
    onKernelSelectionChange?.({
      kernelName: selectedKernelName || undefined,
    });
  }, [selectedKernelName, onKernelSelectionChange]);

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

  return (
    <div className={PanelStyle}>
      <Group gap={4}>
        <Text className={TextStyle}>Launch Kernel</Text>
        <InfoRolloverButton
          label="Launch and manage compute kernels."
          size="sm"
        />
      </Group>
      <div className="mt-4 space-y-4">
        <LoadingOverlay visible={isLoading} />
        <div>
          {/*<label htmlFor="klp-kernel-spec" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-base-dark">Kernel Spec</label>*/}
          <Select
            id="klp-kernel-spec"
            value={selectedKernelName}
            onChange={(value) => setSelectedKernelName(value as string)}
            disabled={disabled || isError}
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
          onClick={() => handleLaunchKernel(selectedKernelName || 'python3')}
          loading={isLaunchingLoading}
          fullWidth
          disabled={disabled || isError}
        >
          {isLaunchingLoading ? 'Working...' : 'Launch Kernel'}
        </Button>
      </div>
    </div>
  );
};

export default KernelSelector;
