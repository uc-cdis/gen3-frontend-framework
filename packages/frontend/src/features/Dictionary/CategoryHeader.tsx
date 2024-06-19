import React, { forwardRef, ReactElement } from 'react';
import { snakeCaseToLabel } from './utils';
import { Avatar } from '@mantine/core';
import { Icon } from '@iconify/react';

const getIcon = (category: string) => {
  const iconName = `gen3:dictionary-icon-${category.replace('_', '-')}`;
  return (
    <Icon color="primary-contrast.4" icon={iconName} height={24} width={24} />
  );
};

interface CategoryHeaderProps {
  category: string;
}
const CategoryHeader = ({ category }: CategoryHeaderProps) => {
  return (
    <h3
      className="flex text-secondary-contrast-darker font-bold font-size-md bg-secondary-darker mb-0 justify-between h-16 uppercase"
      id={category}
    >
      <div className="flex items-center ml-4">
        <Avatar size="sm" color="accent.4" radius="xl">
          {getIcon(category)}
        </Avatar>
        <div className="ml-4">{snakeCaseToLabel(category)}</div>
      </div>
    </h3>
  );
};

CategoryHeader.displayName = 'CategoryHeader';

export default CategoryHeader;
