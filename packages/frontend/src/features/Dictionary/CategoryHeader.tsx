import React, { ReactElement } from 'react';
import { snakeCaseToLabel } from './utils';
import { Avatar } from '@mantine/core';

interface CategoryHeaderProps {
  icon: ReactElement;
  category: string;
}
const CategoryHeader = ({ icon, category }: CategoryHeaderProps) => {
  return (
    <h3 className="flex text-secondary-contrast-darker  font-bold font-size-md bg-secondary-darker border mb-0 justify-between h-16">
      <div className="flex items-center ml-2">
        <Avatar color="accent.4" radius="xl">
          {icon}
        </Avatar>
        <div className="ml-2">{snakeCaseToLabel(category)}</div>
      </div>
    </h3>
  );
};

export default CategoryHeader;
