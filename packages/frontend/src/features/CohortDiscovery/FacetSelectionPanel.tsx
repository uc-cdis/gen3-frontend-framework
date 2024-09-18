import React, { useState, useMemo } from 'react';
import FacetSelector, {
  SelectFacetHooks,
} from '../../components/facets/FacetSelector';
import { TabConfig } from '../CohortBuilder/types';
import { useDeepCompareMemo } from 'use-deep-compare';

interface FacetSelectionPanelProps {
  categories: ReadonlyArray<TabConfig>;
  hooks: SelectFacetHooks;
}

const FacetSelectionPanel: React.FC<FacetSelectionPanelProps> = ({
  categories,
  hooks,
}) => {
  const panels = useDeepCompareMemo(() => {
    return categories.map((item) => {
      const getFields = () => item.fields.map((f) => item.fieldsConfig[f]);

      return (
        <FacetSelector
          key={item.title}
          category={item.title}
          facetName={item.title}
          hooks={{
            ...hooks,
            useGetFields: getFields,
          }}
        ></FacetSelector>
      );
    });
  }, [categories]);

  return <div>{panels}</div>;
};

export default FacetSelectionPanel;
