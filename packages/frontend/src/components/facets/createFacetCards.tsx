import { FacetDefinition } from '@gen3/core';
import React from 'react';
import { createFacetCard, CreateFacetCardProps } from './createFacetCard';
import { FacetDataHooks, FacetType } from './types';

interface CreateFacetCardsProps
  extends Omit<CreateFacetCardProps, 'facetDefinition' | 'hooks'> {
  facets: FacetDefinition[];
  hooks: Record<FacetType, FacetDataHooks>;
}

export const createFacetCards = ({
  facets,
  hooks,
  facetNameFormatter,
  idPrefix,
  valueLabel,
  dismissCallback,
  hideIfEmpty,
  Chart,
  showPercent,
}: CreateFacetCardsProps) => {
  return (
    <div>
      {facets.map((facetDefinition) => {
        return createFacetCard({
          facetDefinition,
          valueLabel,
          hooks: hooks[facetDefinition.type],
          facetNameFormatter,
          idPrefix,
          dismissCallback,
          hideIfEmpty,
          Chart,
          showPercent,
        });
      })}
    </div>
  );
};

export default createFacetCards;
