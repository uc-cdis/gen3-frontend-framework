import React, { ReactNode, useState } from 'react';
import { Tooltip } from '@mantine/core';

type OverflowTooltippedLabelProps = {
  children: ReactNode;
  label: string;
  className?: string;
};

const OverflowTooltippedLabel = ({
  children,
  label,
  className = 'flex-grow font-heading text-md pt-0.5',
}: OverflowTooltippedLabelProps): JSX.Element => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Tooltip
      label={label}
      disabled={!showTooltip}
      position="top-start"
      offset={5}
      multiline
      withArrow
      arrowOffset={20}
      classNames={{
        tooltip:
          'bg-base-min bg-opacity-90 text-base-contrast-min shadow-lg font-content font-medium text-xs',
        arrow: 'bg-base-min bg-opacity-90',
      }}
    >
      <div
        className={`${className} truncate ... `}
        ref={(el) => {
          if (el) {
            if (el.clientWidth < el.scrollWidth) {
              setShowTooltip(true);
            } else {
              setShowTooltip(false);
            }
          }
        }}
      >
        {children}
      </div>
    </Tooltip>
  );
};

export default OverflowTooltippedLabel;
