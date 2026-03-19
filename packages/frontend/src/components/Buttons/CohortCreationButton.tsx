import React, { ReactNode, useEffect, useState } from 'react';
import {
  EmptyFilterSet,
  FilterSet,
  useLazyGetRawDataAndTotalCountsQuery,
} from '@gen3/core';
import { ButtonProps, Tooltip } from '@mantine/core';
import tw from 'tailwind-styled-components';
import { FaPlus as PlusIcon } from 'react-icons/fa';
import { modals } from '@mantine/modals';
import { labelToPlural } from '../../utils/labels';

const MAX_ITEMS = 10000;

interface CohortCreationStyledButtonProps extends ButtonProps {
  $fullWidth?: boolean;
}

export const CohortCreationStyledButton = tw.button<CohortCreationStyledButtonProps>`
  flex
  items-stretch
  w-52
  h-full
  ${(p) => !p.$fullWidth && 'max-w-[125px]'}
  gap-2
  rounded
  border-primary
  border-solid
  border-1
  text-primary
  bg-base-max
  hover:text-base-max
  hover:bg-primary
  disabled:opacity-50
  disabled:bg-base-lightest
  disabled:text-primary
  disabled:border-base-light
  disabled:text-base-light
`;

export const IconWrapperTW = tw.span`
  ${(p: { $disabled: boolean }) =>
    p.$disabled ? 'bg-base-light' : 'bg-accent'}
  border-r-1
  border-solid
  ${(p: { $disabled: boolean }) =>
    p.$disabled ? 'border-base-light' : 'border-primary'}
  flex
  items-center
  p-1
`;

const updateFilters = (facetField: string, outputIds: string[]) => {
  modals.openContextModal({
    modal: 'saveCohortModal',
    title: 'Save Cohort',
    size: 'md',
    zIndex: 1200,
    styles: {
      header: {
        marginLeft: '16px',
      },
    },
    innerProps: {
      facetField,
      outputIds,
      validate: false,
      setAsCurrentCohort: false,
    },
  });
};

interface CohortCreationButtonProps {
  readonly label: ReactNode;
  readonly numObjects: number;
  readonly filter: FilterSet;
  readonly cohortFilter: FilterSet;
  readonly filtersCallback?: () => Promise<FilterSet>;
  readonly createStaticCohort?: boolean;
  readonly dataTypename: string;
  readonly index: string;
  readonly uniqueIdField: string;
}

/**
 * Button to create a new cohort
 * @param label - the text label
 * @param numObjects - the number of cases in the cohort
 * @param filters - the filters to use for the cohort
 * @property filtersCallback - callback to create filters, used when filters are too complicated for FilterSet
 * @category Buttons
 */
const CohortCreationButton: React.FC<CohortCreationButtonProps> = ({
  label,
  numObjects,
  cohortFilter,
  dataTypename,
  index,
  uniqueIdField,
}: CohortCreationButtonProps) => {
  const [loading, setLoading] = useState(false);
  const disabled = numObjects === undefined || numObjects === 0;
  const [getObjectIds, { data, isFetching, isSuccess, isError }] =
    useLazyGetRawDataAndTotalCountsQuery();
  const tooltipText = disabled
    ? `No ${labelToPlural(dataTypename)} available`
    : `Save a new cohort of ${
        numObjects > 1
          ? `these ${numObjects.toLocaleString()} ${labelToPlural(dataTypename)}`
          : `this ${dataTypename}`
      }`;

  useEffect(() => {
    if (isSuccess) {
      const cases: Array<string> =
        data?.data?.CaseCentric_case_centric?.map(
          (caseObj: { case_id: string }) => caseObj.case_id,
        ) ?? [];
      updateFilters('case_id', cases);
      setLoading(false);
    }
    if (isError) setLoading(false);
  }, [data, isError, isFetching, isSuccess]);

  return (
    <div className="p-1">
      <Tooltip
        label={
          disabled ? (
            `No ${labelToPlural(dataTypename)} available`
          ) : (
            <>
              Save a new cohort of{' '}
              {numObjects > 1 ? (
                <>
                  these <b>{numObjects.toLocaleString()}</b> cases
                </>
              ) : (
                `this ${dataTypename}`
              )}
            </>
          )
        }
        withArrow
      >
        <CohortCreationStyledButton
          data-testid="button-save-filtered-cohort"
          onClick={async () => {
            if (loading) {
              return;
            }

            setLoading(true);
            getObjectIds({
              type: index,
              fields: [uniqueIdField],
              filters: cohortFilter ?? EmptyFilterSet,
              size: MAX_ITEMS,
            });
          }}
          disabled={disabled}
          $fullWidth={React.isValidElement(label)} // if the label is JSX.Element take the full width
          aria-label={tooltipText}
        >
          <IconWrapperTW $disabled={disabled} aria-hidden="true">
            <PlusIcon color="white" size={12} />
          </IconWrapperTW>
          <span className="pr-2 self-center">{label ?? '--'}</span>
        </CohortCreationStyledButton>
      </Tooltip>
    </div>
  );
};
export default CohortCreationButton;
