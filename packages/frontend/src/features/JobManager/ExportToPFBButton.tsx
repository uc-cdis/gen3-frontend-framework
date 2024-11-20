import React from 'react';
import { Button, Tooltip } from '@mantine/core';
import { useSubmitFilter } from './hooks';
import { FilterSet } from '@gen3/core';
import { notifications } from '@mantine/notifications';

interface SubmitJobButtonProps {
  filterSet: FilterSet;
  index: string;
  onSuccess?: (uid: string) => void;
  disabled?: boolean;
  className?: string;
}

const ExportToPFBButton: React.FC<SubmitJobButtonProps> = ({
  filterSet,
  index,
  onSuccess,
  disabled = false,
  className,
}) => {
  const { submit, isLoading } = useSubmitFilter();

  const handleClick = async () => {
    const result = await submit(filterSet, index);

    if (result.error) {
      notifications.show({
        title: 'Error',
        message: result.error,
        color: 'red',
      });
    } else if (result.uid) {
      notifications.show({
        title: 'Success',
        message: 'Job submitted successfully',
        color: 'green',
      });
      onSuccess?.(result.uid);
    }
  };

  const buttonText = isLoading ? 'Submitting...' : 'Submit Job';

  return (
    <Tooltip label={disabled ? 'No filters selected' : ''} disabled={!disabled}>
      <Button
        onClick={handleClick}
        loading={isLoading}
        disabled={disabled}
        className={className}
      >
        {buttonText}
      </Button>
    </Tooltip>
  );
};

export default ExportToPFBButton;
