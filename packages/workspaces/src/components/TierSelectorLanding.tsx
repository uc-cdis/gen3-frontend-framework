import React, { useMemo } from 'react';
import {
  DefaultTierLandingClassnames,
  TierSelectorLandingConfiguration,
  WorkspaceCardConfig,
} from './types';
import { type WorkspaceTier } from '../types';
import WorkspaceTierCard from './WorkspaceTierCard';
import { mergeDefaultTailwindClassnames } from '@gen3/frontend';
import { Container, SimpleGrid, Stack, Text } from '@mantine/core';

export interface TierSelectorLandingProps extends Partial<TierSelectorLandingConfiguration> {
  cards: Record<string, WorkspaceCardConfig>;
  onSelectTier: (tier: WorkspaceTier) => void;
}

const DEFAULT_CLASSNAMES: DefaultTierLandingClassnames = {
  root: 'mx-auto w-full h-full overflow-auto max-w-7xl p-6 sm:p-2 md:p-4 lg:p-8',
  background: 'relative overflow-hidden sm:p-2 md:p-4 lg:p-8',
  label: 'text-md uppercase tracking-[0.28em] text-primary',
  description:
    'font-black leading-tight text-primary md:text-3xl sm:text-2xl xs:text-lg mt-4 mb-4',
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
    <Container size="xl" className={mergedClassnames.root}>
      <Stack gap="lg" className={mergedClassnames.background}>
        <Stack gap="xs">
          <Text className={mergedClassnames.label}>{label}</Text>
          <Text className={mergedClassnames.description}>{description}</Text>
          {additionalDescriptions.map((desc) => (
            <Text
              className={mergedClassnames.additionalDescription}
              key={desc.slice(0, 20)}
            >
              {desc}
            </Text>
          ))}
        </Stack>

        <SimpleGrid
          cols={{ base: 2, sm: 2, md: 2, lg: 3 }}
          spacing="md"
          role="list"
          aria-label="Workspace tier selection"
        >
          {Object.values(cards).map((card) => (
            <WorkspaceTierCard
              key={card.tier}
              tier={card.tier}
              tierLabel={card.tierLabel}
              onSelectTier={onSelectTier}
              label={card.label}
              description={card.description}
              features={card.features}
              tooltip={card.tooltip}
              buttonLabel={card.buttonLabel}
              baseColor={card.baseColor}
            />
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
};

export default TierSelectorLanding;
