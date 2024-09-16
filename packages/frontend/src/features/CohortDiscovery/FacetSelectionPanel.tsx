import React, { useMemo } from 'react';
import { CohortDiscoveryCategories } from './types';
import FacetSelector, {
  SelectFacetHooks,
} from '../../components/facets/FacetSelector';

interface FacetSelectionPanelProps {
  categories: Array<CohortDiscoveryCategories>;
  hooks: SelectFacetHooks;
}

const FacetSelectionPanel: React.FC<FacetSelectionPanelProps> = ({
  categories,
  hooks,
}) => {
  const panels = useMemo(() => {
    return categories.map((item) => {
      return (
        <FacetSelector category={item.category} hooks={hooks}></FacetSelector>
      );
    });
  }, []);

  return <div>{panels}</div>;
};

export default FacetSelectionPanel;
