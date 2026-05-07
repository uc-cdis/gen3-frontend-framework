import React from 'react';

export interface UpgradeActionsPanelProps {
  currentTier: 'free' | 'remote';
  onUpgradeToRemote?: () => void;
  onRequestQuotaIncrease?: () => void;
  onOpenBillingSupport?: () => void;
};

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
        <h3 className="text-xs font-bold uppercase tracking-wider text-base-darker">
          Capacity & Upgrade
        </h3>
      </div>

      <div className="space-y-3 p-4">
        <div className="rounded-lg border border-accent-light bg-accent-max p-3">
          <p className="text-sm font-bold text-accent-dark">Current Tier: {currentTier === 'free' ? 'Free' : 'Remote Compute'}</p>
          <p className="mt-1 text-sm text-accent-dark">
            {currentTier === 'free'
              ? 'Upgrade to remote kernels for long-running jobs and larger memory footprints.'
              : 'Remote compute is active. You can request expanded quota for larger workloads.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onUpgradeToRemote}
          disabled={!canUpgrade}
          className="w-full rounded-md border border-primary-light bg-primary-max px-3 py-2.5 text-sm font-bold text-primary hover:bg-primary-light/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Upgrade To Remote Tier
        </button>

        <button
          type="button"
          onClick={onRequestQuotaIncrease}
          disabled={!onRequestQuotaIncrease}
          className="w-full rounded-md border border-base bg-white px-3 py-2.5 text-sm font-semibold text-base-darkest hover:bg-base-lightest disabled:cursor-not-allowed disabled:opacity-60"
        >
          Request Quota Increase
        </button>

        <button
          type="button"
          onClick={onOpenBillingSupport}
          disabled={!onOpenBillingSupport}
          className="w-full rounded-md border border-base bg-white px-3 py-2.5 text-sm font-semibold text-base-darkest hover:bg-base-lightest disabled:cursor-not-allowed disabled:opacity-60"
        >
          Contact Workspace Support
        </button>
      </div>
    </section>
  );
};

export default UpgradeActionsPanel;
