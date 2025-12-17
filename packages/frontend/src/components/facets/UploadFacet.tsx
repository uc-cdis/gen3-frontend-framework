import React from 'react';
import { Button, Tooltip } from '@mantine/core';
import FilterBadge from '../../features/CohortBuilder/QueryExpression/FilterBadge';
import FacetControlsHeader from './FacetControlsHeader';
import { FacetCardProps, UploadFacetDataHooks } from './types';

/**
 * Facet card component for fields were a user can upload a list of values
 */
const UploadFacet: React.FC<FacetCardProps<UploadFacetDataHooks>> = ({
  field,
  facetName,
  facetBtnToolTip,
  hooks,
}) => {
  const hash = window?.location?.hash.split('#')?.[1];
  const cardSelected = hash !== undefined && hash === field;
  const openModal = hooks.useOpenUploadModal();

  const { noData, items } = hooks.useFilterItems(field);
  const useClearUploadFilter = () => {
    const clearFilter = hooks.useClearFilter();
    return (field: string) => clearFilter(field);
  };

  const renderBadges = (items: string[], itemField: string) => {
    return items.map((item, index) => (
      <FilterBadge
        key={`query-rep-${itemField}-${item}-${index}`}
        field={itemField}
        value={item}
        customTestid={`query-rep-${itemField}-${item}-${index}`}
        operands={items}
        operator="includes"
        hooks={{
          useClearFilter: useClearUploadFilter,
          useUpdateFilter: hooks.useUpdateFacetFilters,
        }}
      />
    ));
  };

  return (
    <div
      className={`flex flex-col mx-0 bg-base-max border-base-lighter border-1 rounded-b-md text-xs transition ${
        cardSelected ? 'animate-border-highlight ' : undefined
      }`}
      id={field}
    >
      <FacetControlsHeader
        field={field}
        hooks={{ ...hooks, useClearFilter: useClearUploadFilter }}
        facetName={facetName}
      />
      <div className="p-4">
        <div className="flex justify-center">
          <Tooltip
            disabled={!facetBtnToolTip}
            label={facetBtnToolTip}
            multiline
            w={220}
            withArrow
            transitionProps={{ duration: 200, transition: 'fade' }}
          >
            <Button
              variant="outline"
              fullWidth
              onClick={() => openModal(field)}
              data-testid={`button-${facetName}`}
            >
              Upload
            </Button>
          </Tooltip>
        </div>
        {/* h-96 is max height for the content of ExactValueFacet, EnumFacet, UploadFacet */}
        <div className="mt-2 max-h-96 overflow-y-auto">
          {noData ? null : (
            <div className="flex flex-wrap gap-1">
              {renderBadges(items as string[], field)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadFacet;
