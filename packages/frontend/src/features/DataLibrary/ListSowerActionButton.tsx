import SubmitSowerJobButton from '../Sower/actions/SubmitSowerJobButton';
import type { CreateAndExportOutputConfig } from '@gen3/core';
import type { ButtonIcon } from '../../components/Buttons/ButtonIcon';
import { buildIcon } from '../../components/Buttons/ButtonIcon';

interface ListActionButtonProps {
  label: string;
  listId: string;
  sowerJobName: string;
  rightIcon?: ButtonIcon;
  leftIcon?: ButtonIcon;
  tooltip?: string;
  size?: string;
}

// Wrapper around SubmitSowerJobButton for ListBased Sower Jobs

const ListSowerActionButton = ({
  listId,
  sowerJobName,
  leftIcon,
  tooltip,
  rightIcon,
  label,
  size = 'xs',
}: ListActionButtonProps) => {
  // Build the action object for the SubmitSowerJobButton
  const actions: CreateAndExportOutputConfig = {
    jobAction: {
      name: sowerJobName,
      parameters: {
        listId,
      },
    },
    outputAction: {
      name: 'notification',
      parameters: {
        message: 'The job has completed',
      },
    },
  };
  // Render the SubmitSowerJobButton with the provided props
  return (
    <SubmitSowerJobButton
      actions={actions}
      leftIcon={buildIcon(leftIcon)}
      rightIcon={buildIcon(rightIcon)}
      tooltipText={tooltip}
      label={label}
      size={size}
      variant="outline"
    />
  );
};

export default ListSowerActionButton;
