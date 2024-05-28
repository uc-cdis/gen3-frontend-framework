import { Group, Button, UnstyledButton, Text } from '@mantine/core';

interface CategoryLabelProps {
  label: string;
  description: string;
}

const CategoryAccordionLabel = ({ label, description }: CategoryLabelProps) => {
  return (
    <Group noWrap>
      <Text className="min-w-40 max-w-40">{label}</Text>
      <Text size="sm" color="dimmed" weight={400}>
        {description}
      </Text>
    </Group>
  );
};

export default CategoryAccordionLabel;
