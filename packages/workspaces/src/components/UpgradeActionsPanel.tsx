import React from 'react';
import { Button } from '@mantine/core';
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
  const canUpgrade = currentTier === 'free' && Boolean(onUpgradeToRemote);

  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-base bg-white shadow-sm">
      <div className="border-b border-base-lighter bg-base-lightest bg-opacity-40 px-4 py-3 backdrop-blur-sm">
        <h3 className="text-md font-bold uppercase tracking-wider text-base-darker">
          Capacity & Upgrade
        </h3>
      </div>

      <div className="space-y-3 p-4">
        <div className="rounded-lg border border-accent-light bg-accent-max p-3">
          <p className="text-sm font-bold text-accent-dark">
            Current Tier: {currentTier === 'free' ? 'Free' : 'Remote Compute'}
          </p>
          <p className="mt-1 text-sm text-accent-dark">
            {currentTier === 'free'
              ? 'Upgrade to remote kernels for long-running jobs and larger memory footprints.'
              : 'Remote compute is active. You can request expanded quota for larger workloads.'}
          </p>
        </div>

        {currentTier === 'free' && (
          <Button
            onClick={onUpgradeToRemote}
            disabled={!canUpgrade}
            className="w-full border-primary-light"
            variant="light"
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
