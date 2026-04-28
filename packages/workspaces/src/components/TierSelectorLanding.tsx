import React from 'react';
import { WorkspaceCardConfig, type WorkspaceTier } from './types';
import WorkspaceTierCard from './WorkspaceTierCard';

type TierSelectorLandingProps = {
  cards: WorkspaceCardConfig[];
  onSelectTier: (tier: WorkspaceTier) => void;
  className?: string;
};

const TierSelectorLanding = ({
  cards,
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
          {cards.map((card) => (
            <WorkspaceTierCard
              key={card.tier}
              tier={card.tier}
              onSelectTier={onSelectTier}
              label={card.label}
              description={card.description}
              features={card.features}
              tooltip={card.tooltip}
              buttonLabel={card.buttonLabel}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export type { TierSelectorLandingProps };
export default TierSelectorLanding;
