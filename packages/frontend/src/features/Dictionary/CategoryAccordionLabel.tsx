import { Group, Button, UnstyledButton, Text } from '@mantine/core';

interface CategoryLabelProps {
  label: string;
  description: string;
}

const CategoryAccordionLabel = ({ label, description }: CategoryLabelProps) => {
  return (
    <Group
      wrap='nowrap'
      className="odd:text-base-contrast-lightest even:bg-base-contrast-max"
    >
      <Text className="min-w-40 max-w-40" fw={600}>
        {label}
      </Text>
      <Text size="sm" className="opacity-95">
        {description}
      </Text>
    </Group>
  );
};

export default CategoryAccordionLabel;
