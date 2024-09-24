import React from 'react';
import { FacetCommonHooks, FacetSelector } from '../../components/facets';

import { TabConfig } from '../CohortBuilder/types';
import { useDeepCompareMemo } from 'use-deep-compare';
import { FacetDefinition } from '@gen3/core';

interface FacetSelectionPanelProps {
  categories: ReadonlyArray<TabConfig>;
  hooks: FacetCommonHooks;
  selectedFields: Array<string>;
  updateSelectedField: (facet: string) => void;
}

const FacetSelectionPanel: React.FC<FacetSelectionPanelProps> = ({
  categories,
  hooks,
  selectedFields,
  updateSelectedField,
}) => {
  const panels = useDeepCompareMemo(() => {
    return categories.map((item) => {
      const fields = item.fields.map((f) => item.fieldsConfig[f]);

      return (
        <FacetSelector
          fields={fields}
          key={item.title}
          category={item.title}
          facetName={item.title}
          selectedFields={selectedFields}
          updateSelectedField={updateSelectedField}
          hooks={{
            ...hooks,
          }}
        ></FacetSelector>
      );
    });
  }, [categories, selectedFields, updateSelectedField, hooks]);

  return <div className="w-1/3 flex flex-col p-4 gap-y-6">{panels}</div>;
};

export default FacetSelectionPanel;
