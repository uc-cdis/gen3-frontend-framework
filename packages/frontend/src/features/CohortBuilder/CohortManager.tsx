import {
  useCoreSelector,
  selectCurrentCohortId,
  selectCurrentCohortName,
} from '@gen3/core';

import { useCohortFacetFilters } from './hooks';
import QueryExpressionSection from './QueryExpressionSection';

interface CohortManagerProps {
    index: string;
}

const CohortManager : React.FC<CohortManagerProps> = ( { index } : CohortManagerProps) => {
  const currentCohortId = useCoreSelector((state) =>
    selectCurrentCohortId(state)
  );
  const currentCohortName = useCoreSelector((state) =>
    selectCurrentCohortName(state)
  );
  const filters = useCohortFacetFilters(index);

  return <div className="mb-2">
      <QueryExpressionSection
          index={index}
          filters={filters}
          currentCohortName={currentCohortName}
          currentCohortId={currentCohortId}
      />
  </div>;
};

export default CohortManager;
