import React from 'react';
import { Group, Text } from '@mantine/core';

interface FacetPanelDataHeaderProps {
  label: string;
  valueLabel: string;
}

const FacetPanelDataHeader: React.FC<FacetPanelDataHeaderProps> = ({
  label,
  valueLabel,
}) => {
  return (
    <Group justify="space-between">
      <Text>{label}</Text>
      <Text>{valueLabel}</Text>
    </Group>
  );
};

export default FacetPanelDataHeader;
