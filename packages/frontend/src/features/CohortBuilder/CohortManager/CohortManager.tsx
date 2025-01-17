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
import CohortActions from './CohortActions';

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

  const onSave = () => {};
  const onSaveAs = () => {};
  const onDelete = () => {};
  return (
    <div className="flex items-center gap-2 md:gap-4 mb-2 bg-secondary-lighter px-2">
      <CohortSelector index={index} filters={filters} />
      <CohortActions
        onSave={onSave}
        onSaveAs={onSaveAs}
        onDelete={onDelete}
        index={index}
      />
    </div>
  );
};

export default CohortManager;
