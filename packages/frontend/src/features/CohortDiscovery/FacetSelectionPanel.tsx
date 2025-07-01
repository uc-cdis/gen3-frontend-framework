import React from 'react';
import { FacetCommonHooks, FacetSelector } from '../../components/facets';

import { TabConfig } from '../CohortBuilder/types';
import { useDeepCompareMemo } from 'use-deep-compare';

interface FacetSelectionPanelProps {
  categories: ReadonlyArray<TabConfig>;
  hooks: FacetCommonHooks;
  selectedFields: Array<string>;
  updateSelectedField: (facet: string, checked: boolean) => void;
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

  return (
    <div className="sm:w-40 md:w-80 lg:w-96 xl:w-1/4 flex flex-col flex-shrink-0 p-4 gap-y-6">
      {panels}
    </div>
  );
};

export default FacetSelectionPanel;
