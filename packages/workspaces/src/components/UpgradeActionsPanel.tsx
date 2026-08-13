import React from 'react';
import { Button, Group, Stack, Text } from '@mantine/core';
import { Icon } from '@iconify-icon/react';
import { WorkspaceTier } from '../types';

export interface UpgradeActionsPanelProps {
  currentTier: WorkspaceTier;
  onUpgradeToRemote?: () => void;
  onRequestQuotaIncrease?: () => void;
  onOpenBillingSupport?: () => void;
}

const UpgradeActionsPanel = ({
  currentTier,
  onUpgradeToRemote,
  onRequestQuotaIncrease,
  onOpenBillingSupport,
}: UpgradeActionsPanelProps) => {
  const canUpgrade = currentTier === 'free' || Boolean(onUpgradeToRemote);

  return (
    <section className="mt-6 overflow-hidden rounded-xl border-2 border-base bg-base-max shadow-sm">
      <div className="px-4 py-3">
        <Group justify="space-between" wrap="nowrap">
          <Text size="lg" fw={600} c="base-darker" tt="uppercase">
            Capacity & Upgrade
          </Text>
          <Icon icon="gen3:bolt" width={16} height={16} />
        </Group>
      </div>

      <div className="space-y-2 p-4 pt-0">
        <Stack>
          <p className="my-1 text-sm text-base-contrast-max">
            {currentTier === 'free'
              ? 'Upgrade to remote kernels for long-running jobs and larger memory footprints.'
              : 'Remote compute is active. You can request expanded quota for larger workloads.'}
          </p>
        </Stack>

        {currentTier === 'free' && (
          <Button
            onClick={onUpgradeToRemote}
            disabled={!canUpgrade}
            className="w-full border-primary-light"
            variant="filled"
            leftSection={
              <Icon icon="gen3:up-trend-arrow" width={16} height={16} />
            }
          >
            Upgrade To Remote Tier
          </Button>
        )}
        {currentTier !== 'free' && (
          <>
            <Button
              onClick={onRequestQuotaIncrease}
              disabled={!onRequestQuotaIncrease}
              className="w-full"
              variant="default"
            >
              Request Quota Increase
            </Button>
            <Button
              onClick={onOpenBillingSupport}
              disabled={!onOpenBillingSupport}
              className="w-full"
              variant="default"
            >
              Contact Workspace Support
            </Button>{' '}
          </>
        )}
      </div>
    </section>
  );
};

export default UpgradeActionsPanel;
