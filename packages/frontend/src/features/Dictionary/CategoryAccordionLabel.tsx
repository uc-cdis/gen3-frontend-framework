import { Group, Button, UnstyledButton, Text } from '@mantine/core';

interface CategoryLabelProps {
  label: string;
  description: string;
}

const CategoryAccordionLabel = ({ label, description }: CategoryLabelProps) => {
  return (
    <Group noWrap>
      <Text>{label}</Text>
      <Text size="sm" color="dimmed" weight={400}>
        {description}
      </Text>
    </Group>
  );
};

export default CategoryAccordionLabel;
