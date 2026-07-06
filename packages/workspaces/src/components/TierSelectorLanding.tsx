import React, { useMemo } from 'react';
import {
  DefaultTierLandingClassnames,
  TierSelectorLandingConfiguration,
  WorkspaceCardConfig,
} from './types';
import { type WorkspaceTier } from '../types';
import WorkspaceTierCard from './WorkspaceTierCard';
import { mergeDefaultTailwindClassnames } from '@gen3/frontend';

export interface TierSelectorLandingProps extends Partial<TierSelectorLandingConfiguration> {
  cards: Record<string, WorkspaceCardConfig>;
  onSelectTier: (tier: WorkspaceTier) => void;
}

const DEFAULT_CLASSNAMES: DefaultTierLandingClassnames = {
  root: 'mx-auto w-full max-w-7xl p-6 md:p-10',
  background: 'relative overflow-hidden md:p-12',
  label: 'text-md uppercase tracking-[0.28em] text-primary',
  description:
    'text-4xl font-black leading-tight text-primary md:text-3xl sm:text-2xl mt-4 mb-4',
  additionalDescription: 'max-w-2xl text-md font-medium text-base-contrast',
  button:
    'mt-10 flex w-full items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-semibold text-primary-contrast shadow-sm hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
};

const TierSelectorLanding = ({
  cards,
  onSelectTier,
  classNames,
  label = 'Gen3 JupyterHub Workspaces',
  description = 'Launch a secure notebook workspace',
  additionalDescriptions = [
    'Choose local browser notebooks for speed or remote kernels for scalable compute',
    'Both modes preserve your host app auth context.',
  ],
}: TierSelectorLandingProps) => {
  const mergedClassnames = useMemo(
    () => mergeDefaultTailwindClassnames(DEFAULT_CLASSNAMES, classNames ?? {}),
    [classNames],
  );

  return (
    <div className={mergedClassnames.root}>
      <div className={mergedClassnames.background}>
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-md uppercase tracking-[0.28em] text-primary">
              {label}
            </p>
            <p className={mergedClassnames.description}>{description}</p>
            {additionalDescriptions.map((desc) => (
              <p
                className={mergedClassnames.additionalDescription}
                key={desc.slice(0, 20)}
              >
                {desc}
              </p>
            ))}
          </div>
        </div>

        <div
          className="grid gap-5 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1"
          role="list"
          aria-label="Workspace tier selection"
        >
          {Object.values(cards).map((card) => (
            <WorkspaceTierCard
              key={card.tier}
              tier={card.tier}
              onSelectTier={onSelectTier}
              label={card.label}
              description={card.description}
              features={card.features}
              tooltip={card.tooltip}
              buttonLabel={card.buttonLabel}
              baseColor={card.baseColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TierSelectorLanding;
