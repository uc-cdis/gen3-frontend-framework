import { Button, Tooltip } from '@mantine/core';
import { DownloadButtonProps } from './DropdownButtons';

const ActionButton = ({
  title,
  enabled,
  type,
  leftIcon,
  rightIcon,
  fileName,
  tooltipText,
}: DownloadButtonProps) => {
  return (
    <Button
      color="secondary"
      disabled={enabled !== undefined ? !enabled : true}
    >
      {title}
    </Button>
  );
};

export default ActionButton;
