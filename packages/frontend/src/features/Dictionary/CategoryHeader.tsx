import React from 'react';
import { snakeCaseToLabel } from './utils';
import { Avatar } from '@mantine/core';
import { Icon } from '@iconify-icon/react';

const getIcon = (category: string) => {
  const iconName = `dataDictionary:${category.replace('_', '-')}`;
  return (
    <Icon color="primary-contrast.4" icon={iconName} height={32} width={32} />
  );
};

interface CategoryHeaderProps {
  category: string;
}
const CategoryHeader = ({ category }: CategoryHeaderProps) => {
  return (
    <h3
      className="flex text-secondary-contrast font-bold font-size-md bg-secondary mb-0 justify-between h-16 uppercase"
      id={category}
    >
      <div className="flex items-center ml-4">
        <Avatar
          variant="light"
          size="md"
          color="accent.4"
          radius="xl"
          style={{ '--avatar-bg': 'var(--mantine-color-accent-0' }}
        >
          {getIcon(category)}
        </Avatar>
        <div className="ml-4">{snakeCaseToLabel(category)}</div>
      </div>
    </h3>
  );
};

CategoryHeader.displayName = 'CategoryHeader';

export default CategoryHeader;
