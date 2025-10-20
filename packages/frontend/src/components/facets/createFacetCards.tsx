import { createFacetCard, CreateFacetCardProps } from './createFacetCard';
import { FacetDataHooks } from './types';
import { FacetDefinition, FacetType } from '@gen3/core';

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
  return facets.map((facetDefinition) => {
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
  });
};

export default createFacetCards;
