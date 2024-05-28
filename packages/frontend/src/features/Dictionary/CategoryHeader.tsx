import React, { ReactElement } from 'react';
import { SnakeCaseToLabel } from './utils';
import { Avatar } from '@mantine/core';

interface CategoryHeaderProps {
  icon: ReactElement;
  category: string;
}
const CategoryHeader = ({ icon, category }: CategoryHeaderProps) => {
  return (
    <h3 className="flex text-white font-bold font-size-md bg-purple-500 border mb-0 justify-between h-16">
      <div className="flex items-center ml-2">
        <Avatar color="blue" radius="xl">
          {icon}
        </Avatar>
        <div className="ml-2">{SnakeCaseToLabel(category)}</div>
      </div>
    </h3>
  );
};

export default CategoryHeader;
