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
  persistCurrentCohort,
} from '@gen3/core';

import { modals } from '@mantine/modals';

import { useCohortFacetFilters } from '../hooks';
import CohortSelector from './CohortSelector';
import CohortActions from './CohortActions';
import { SaveOrCreateEntityBody } from './modals/SaveOrCreateEntityModal';

export const INVALID_COHORT_NAMES = ['unsaved_cohort'];

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
  const coreDispatch = useCoreDispatch();

  const handleSaveAction = (name: string, saveAs: boolean) => {
    if (!saveAs) {
      coreDispatch(persistCurrentCohort(name));
    }
  };

  const openSaveModal = (name: string, saveAs: boolean = false) =>
    modals.open({
      title: 'Save Cohort',
      children: (
        <SaveOrCreateEntityBody
          entity="cohort"
          action="Save"
          initialName={currentCohortName}
          onClose={() => modals.closeAll()}
          onActionClick={(name: string) => {
            handleSaveAction(name, false);
          }}
          descriptionMessage={
            saveAs
              ? 'Provide a name to save your current cohort as a new cohort'
              : 'Provide a name to save the cohort.'
          }
          closeOnAction={true}
          disallowedNames={INVALID_COHORT_NAMES}
        />
      ),
    });

  const onSave = () => {
    openSaveModal(currentCohortName);
  };
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
