import React, { useMemo } from 'react';
import { CohortDiscoveryGroup } from './types';
import FacetSelector, {
  SelectFacetHooks,
} from '../../components/facets/FacetSelector';
import { TabConfig } from '../CohortBuilder/types';

interface FacetSelectionPanelProps {
  categories: ReadonlyArray<TabConfig>;
  hooks: SelectFacetHooks;
}

const FacetSelectionPanel: React.FC<FacetSelectionPanelProps> = ({
  categories,
  hooks,
}) => {
  const panels = useMemo(() => {
    return categories.map((item) => {
      const getFields = () => item.fields.map((f) => item.fieldsConfig[f]);

      return (
        <FacetSelector
          category={item.title}
          facetTitle={item.title}
          hooks={{
            ...hooks,
            useGetFields: getFields,
          }}
        ></FacetSelector>
      );
    });
  }, []);

  return <div>{panels}</div>;
};

export default FacetSelectionPanel;
