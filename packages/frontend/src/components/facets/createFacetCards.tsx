import { FacetDefinition } from '@gen3/core';
import React from 'react';
import { createFacetCard, CreateFacetCardProps } from './createFacetCard';

interface CreateFacetCardsProps
  extends Omit<CreateFacetCardProps, 'facetDefinition'> {
  facets: FacetDefinition[];
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
          hooks,
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
