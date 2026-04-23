import React, { ReactElement } from 'react';
import { Spoiler } from '@mantine/core';
import {
  MdKeyboardArrowDown as DownArrowIcon,
  MdKeyboardArrowUp as UpArrowIcon,
} from 'react-icons/md';

interface TextDescriptionProps {
  description: string;
}

const TextDescription = ({
  description,
}: TextDescriptionProps): ReactElement => {
  return (
    <Spoiler
      classNames={{ control: 'text-sm font-semibold' }}
      maxHeight={80}
      showLabel={
        <span>
          Extend Text <DownArrowIcon className="inline" />
        </span>
      }
      hideLabel={
        <span>
          Collapse Text <UpArrowIcon className="inline" />
        </span>
      }
    >
      {description}
    </Spoiler>
  );
};
export default TextDescription;
