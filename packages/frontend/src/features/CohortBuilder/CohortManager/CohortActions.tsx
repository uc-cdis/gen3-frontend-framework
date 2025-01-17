import React, { useCallback, useState } from 'react';
import {
  addNewDefaultUnsavedCohort,
  selectCurrentCohortModified,
  selectCurrentCohortName,
  selectCurrentCohortSaved,
  useCoreDispatch,
  useCoreSelector,
} from '@gen3/core';
import { Tooltip } from '@mantine/core';
import { DropdownWithIcon } from '../../../components/DropdownWithIcon/DropdownWithIcon';
import { CohortGroupButton } from '../style';
import { useDeepCompareCallback, useDeepCompareEffect } from 'use-deep-compare';
import {
  AddIcon,
  DeleteIcon,
  DownloadIcon,
  SaveIcon,
  UploadIcon,
} from '../../../utils/icons';
import JSONObjectDownloadButton from '../../../components/Buttons/DownloadButtons/JSONObjectDownloadButton';
import UploadJSONButton from '../../../components/Buttons/UploadJSONButton';
import { useCohortFacetFilters } from '../hooks';

interface CohortActionsProps {
  onSave: () => void;
  onSaveAs: () => void;
  onDelete: () => void;
  index: string;
}

const CohortActions: React.FC<CohortActionsProps> = ({
  onSave,
  onSaveAs,
  onDelete,
  index,
}: CohortActionsProps) => {
  const coreDispatch = useCoreDispatch();
  // const hasUnsavedCohorts = useCoreSelector(selectHasUnsavedCohorts);
  const currentCohortName = useCoreSelector(selectCurrentCohortName);
  const currentCohortSaved = useCoreSelector(selectCurrentCohortSaved);
  const currentCohortModified = useCoreSelector(selectCurrentCohortModified);
  const currentCohortFilters = useCohortFacetFilters(index);
  const [exportCohortPending, setExportCohortPending] = useState(false);
  const handleAdd = useDeepCompareCallback(() => {
    coreDispatch(addNewDefaultUnsavedCohort());
  }, [coreDispatch]);

  // coreDispatch  const getData = useDeepCompareCallback(() => {
  //     return filters;
  //   }, [filters]);
  //
  //   const setCohort = useDeepCompareCallback(
  //     (data: string) => {
  //       const jsonForm = JSON.parse(data);
  //       coreDispatch(setCohortFilter({ index, filters: jsonForm as FilterSet }));
  //     },
  //     [index, coreDispatch],
  //   );

  return (
    <div className="flex justify-center items-center gap-2 md:gap-4">
      <Tooltip label="Save Cohort" position="top" withArrow>
        <span className="h-12">
          <DropdownWithIcon
            customDataTestId="saveButton"
            dropdownElements={[
              {
                onClick: onSave,
                title: 'Save',
                disabled: currentCohortSaved && !currentCohortModified,
              },
              {
                onClick: onSaveAs,
                title: 'Save As',
                disabled: !currentCohortSaved,
              },
            ]}
            LeftSection={
              <SaveIcon size="1.5em" className="-mr-2.5" aria-hidden="true" />
            }
            TargetButtonChildren=""
            fullHeight
            disableTargetWidth
            buttonAriaLabel="Save cohort"
          />
        </span>
      </Tooltip>

      <Tooltip label="Create New Unsaved Cohort" position="bottom" withArrow>
        <CohortGroupButton
          onClick={handleAdd}
          data-testid="addButton"
          aria-label="Add cohort"
        >
          <AddIcon size="1.5em" aria-hidden="true" />
        </CohortGroupButton>
      </Tooltip>

      <Tooltip label="Delete Cohort" position="bottom" withArrow>
        <CohortGroupButton
          data-testid="deleteButton"
          onClick={onDelete}
          aria-label="Delete cohort"
        >
          <DeleteIcon size="1.5em" aria-hidden="true" />
        </CohortGroupButton>
      </Tooltip>

      <UploadJSONButton
        handleFileChange={() => {
          return {};
        }}
        tooltip="Import Cohort"
      />
      <JSONObjectDownloadButton
        getData={() => {
          return {};
        }}
        filename="cohort.json"
        tooltip="Export Cohort"
      />
    </div>
  );
};

export default CohortActions;
