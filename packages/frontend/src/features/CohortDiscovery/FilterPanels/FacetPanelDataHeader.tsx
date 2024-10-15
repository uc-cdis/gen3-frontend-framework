import React from 'react';
import { Checkbox, Group, Text } from '@mantine/core';

interface FacetPanelDataHeaderProps {
  label: string;
  valueLabel: string;
}

const FacetPanelDataHeader: React.FC<FacetPanelDataHeaderProps> = ({
  label,
  valueLabel,
}) => {
  return (
    <Group justify="space-between" className="border-1 border-base p-2 px-4">
      <div className="flex">
        <Text size="sm" fw={600}>
          {label}
        </Text>
      </div>
      <Text size="sm" fw={600}>
        {valueLabel}
      </Text>
    </Group>
  );
};

export default FacetPanelDataHeader;
