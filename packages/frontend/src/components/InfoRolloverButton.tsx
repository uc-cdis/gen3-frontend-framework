import React from 'react';
import { ActionIcon, Tooltip, TooltipProps } from '@mantine/core';
import { Icon } from '@iconify-icon/react';

type InfoRolloverButtonColor =
  | 'blue'
  | 'teal'
  | 'red'
  | 'yellow'
  | 'gray'
  | 'violet';

type InfoRolloverButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface InfoRolloverButtonProps {
  /** Accessible label describing what the info is about */
  label: string;
  color?: InfoRolloverButtonColor;
  size?: InfoRolloverButtonSize;
  tooltipProps?: Partial<TooltipProps>;
}

const sizeMap: Record<
  InfoRolloverButtonSize,
  { icon: number; action: number }
> = {
  sm: { icon: 10, action: 16 },
  md: { icon: 13, action: 20 },
  lg: { icon: 16, action: 26 },
  xl: { icon: 20, action: 34 },
};

export function InfoRolloverButton({
  label,
  color = 'blue',
  size = 'md',
  tooltipProps,
}: InfoRolloverButtonProps) {
  const { icon, action } = sizeMap[size];

  return (
    <Tooltip
      label={label}
      withArrow
      multiline
      maw={240}
      events={{ hover: true, focus: true, touch: true }}
      {...tooltipProps}
    >
      <ActionIcon
        variant="filled"
        color={color}
        radius="xl"
        size={action}
        aria-label={label}
        aria-haspopup="true"
      >
        <Icon icon="gen3:info" size={icon} aria-hidden />
      </ActionIcon>
    </Tooltip>
  );
}

export default InfoRolloverButton;
