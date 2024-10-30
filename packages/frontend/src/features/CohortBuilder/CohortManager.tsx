import {
  useCoreSelector,
  selectCurrentCohortId,
  selectCurrentCohortName,
  CoreState,
} from '@gen3/core';

import { useCohortFacetFilters } from './hooks';
import QueryExpressionSection from './QueryExpressionSection';
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
    <div className="mb-2">
      <QueryExpressionSection
        index={index}
        filters={filters}
        currentCohortName={currentCohortName}
        currentCohortId={currentCohortId}
      />
    </div>
  );
};

export default CohortManager;
