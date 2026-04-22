import React from 'react';
import { type WorkspaceTier } from './types';

type TierSelectorLandingProps = {
  onSelectTier: (tier: WorkspaceTier) => void;
  className?: string;
};

const TierSelectorLanding = ({
  onSelectTier,
  className,
}: TierSelectorLandingProps) => {
  return (
    <div className={`mx-auto w-full max-w-7xl p-6 md:p-10 ${className}`}>
      <div
        className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-primary-light/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-accent-light/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white via-white to-slate-50 p-8 shadow-2xl shadow-slate-300/40 md:p-12">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-primary">
              Gen3 Jupyter Workspaces
            </p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-slate-900 md:text-5xl">
              Launch a secure notebook workspace
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-medium text-slate-700 md:text-base">
              Choose local browser notebooks for speed or remote kernels for
              scalable compute. Both modes preserve your host app auth context.
            </p>
          </div>
        </div>

        <div
          className="grid gap-5 lg:grid-cols-3"
          role="list"
          aria-label="Workspace tier selection"
        >
          <button
            type="button"
            onClick={() => onSelectTier('free')}
            className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm ring-1 ring-slate-100 transition-all duration-200 hover:-translate-y-1 hover:border-primary-light hover:shadow-lg hover:shadow-primary-light/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Select Free tier"
          >
            <div className="inline-flex rounded-full bg-primary-light/20 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-primary">
              Free
            </div>
            <p className="mt-3 text-xl font-black text-slate-900">
              JupyterLite in browser
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Instant startup and lightweight notebooks directly in your
              browser.
            </p>
            <ul className="mt-4 space-y-2 text-xs font-semibold text-slate-600">
              <li>Fast startup, no remote kernel wait</li>
              <li>Great for exploratory analysis</li>
            </ul>
            <p className="mt-6 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary">
              Launch Local Workspace
              <span aria-hidden="true">→</span>
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSelectTier('remote')}
            className="group rounded-2xl border border-accent-light/60 bg-gradient-to-b from-accent-max to-white p-6 text-left shadow-sm ring-1 ring-accent-light/30 transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-lg hover:shadow-accent-light/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            aria-label="Select Paid Remote Kernel tier"
          >
            <div className="inline-flex rounded-full bg-accent-light/20 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-accent-dark">
              Paid
            </div>
            <p className="mt-3 text-xl font-black text-slate-900">
              Remote kernel runtime
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Attach to remote compute for longer sessions and larger workloads.
            </p>
            <ul className="mt-4 space-y-2 text-xs font-semibold text-slate-600">
              <li>Persistent sessions and gateway routing</li>
              <li>Designed for heavier workloads</li>
            </ul>
            <p className="mt-6 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-accent-dark">
              Launch Remote Workspace
              <span aria-hidden="true">→</span>
            </p>
          </button>

          <div
            className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-left"
            role="listitem"
            aria-label="Secure tier coming soon"
          >
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
              Coming Soon
            </p>
            <p className="mt-2 text-xl font-black text-slate-900">
              High assurance mode
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Dedicated mode for workflows that need additional policy controls
              and hardened runtime posture.
            </p>
            <p className="mt-4 inline-flex rounded-full bg-slate-200 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600">
              Not yet available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export type { TierSelectorLandingProps };
export default TierSelectorLanding;
