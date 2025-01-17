import {
  useCoreSelector,
  selectCurrentCohortId,
  selectCurrentCohortName,
  CoreState,
  useCoreDispatch,
  clearCohortFilters,
  removeCohortFilter,
  Operation,
  updateCohortFilter,
  FilterSet,
  setCohortFilter,
} from '@gen3/core';

import { useCohortFacetFilters } from '../hooks';
import QueryExpressionSection from '../QueryExpression/QueryExpressionSection';
import { QueryExpressionContext } from '../QueryExpression/QueryExpressionContext';
import CohortSelector from './CohortSelector';

interface CohortManagerProps {
  index: string;
}

const CohortManager = ({ index }: CohortManagerProps) => {
  const currentCohortId = useCoreSelector((state: CoreState) =>
    selectCurrentCohortId(state),
  );
  const currentCohortName = useCoreSelector((state: CoreState) =>
    selectCurrentCohortName(state),
  );
  const filters = useCohortFacetFilters(index);

  return (
    <div className="flex flex-col mb-2">
      <CohortSelector index={index} filters={filters} />
    </div>
  );
};

export default CohortManager;
