import React from 'react';
import { SegmentedControl, useMantineTheme } from '@mantine/core';
import { Accessibility } from '@gen3/core';

const AccessData = [
  { value: Accessibility.ALL, label: 'All' },
  { value: Accessibility.ACCESSIBLE, label: 'Accessible' },
  { value: Accessibility.UNACCESSIBLE, label: 'Not Accessible' },
];

export interface AccessLevelControlProps {
  onChange: (value: Accessibility) => void;
  accessLevel: Accessibility;
}

const AccessLevelControl = ({
  onChange,
  accessLevel,
}: AccessLevelControlProps) => {
  const theme = useMantineTheme();
  return (
    <SegmentedControl
      color={theme.colors.accent[5]}
      data={AccessData}
      value={accessLevel}
      onChange={(val) => {
        const accessibilityValue =
          AccessData.find((item) => item.value === val)?.value ||
          Accessibility.ALL;
        onChange(accessibilityValue);
      }}
    />
  );
};

export default AccessLevelControl;
