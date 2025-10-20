import React, { useContext } from 'react';
import { Operation } from '@gen3/core';
import { ActionIcon, Badge } from '@mantine/core';
import OverflowTooltippedLabel from '../../../components/OverflowTooltippedLabel';
import { QueryExpressionsExpandedContext } from './QueryExpressionsExpandedContext';
import { MdClose as CloseIcon } from 'react-icons/md';

const RemoveButton = ({ label }: { label: string }) => (
  <ActionIcon
    size="xs"
    color="white"
    radius="xl"
    variant="transparent"
    aria-label={`remove ${label}`}
  >
    <CloseIcon size={10} aria-hidden="true" />
  </ActionIcon>
);

interface FilterBadgeProps {
  field: string;
  value: string;
  customTestid: string;
  operands: readonly (string | number)[];
  operator: 'includes' | 'excludes' | 'excludeifany';
  hooks: {
    useSelectCurrentCohort?: () => any;
    useClearFilter: () => (field: string) => void;
    useUpdateFilter: () => (field: string, operation: Operation) => void;
  };
}
const FilterBadge: React.FC<FilterBadgeProps> = ({
  field,
  value,
  customTestid,
  hooks,
  operands,
  operator,
}: FilterBadgeProps) => {
  const [, setQueryExpressionsExpanded] = useContext(
    QueryExpressionsExpandedContext,
  );
  const { useSelectCurrentCohort = () => undefined } = hooks;
  const currentCohort = useSelectCurrentCohort();
  const updateFilter = hooks.useUpdateFilter();
  const removeFilter = hooks.useClearFilter();

  const handleOnClick = () => {
    const newOperands = operands.filter((o) => o !== value);

    if (newOperands.length === 0) {
      if (currentCohort && setQueryExpressionsExpanded) {
        setQueryExpressionsExpanded({
          type: 'clear',
          cohortId: currentCohort.id,
          field,
        });
      }
      removeFilter(field);
    } else {
      updateFilter(field, {
        operator,
        field,
        operands: newOperands,
      });
    }
  };

  return (
    <Badge
      data-testid={customTestid}
      variant="filled"
      color="primary"
      size="md"
      className="normal-case items-center max-w-[162px] cursor-pointer pl-1.5 pr-0 hover:bg-primary-lighter"
      rightSection={<RemoveButton label={value} />}
      onClick={handleOnClick}
    >
      <OverflowTooltippedLabel
        label={value}
        className="flex-grow text-md font-content-noto"
      >
        {value}
      </OverflowTooltippedLabel>
    </Badge>
  );
};

export default FilterBadge;
