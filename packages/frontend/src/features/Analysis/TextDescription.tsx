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
      classNames={{
        control:
          'text-sm font-semibold rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
      }}
      maxHeight={100}
      showLabel={
        <span>
          Extend Text <DownArrowIcon className="inline" aria-hidden="true" />
        </span>
      }
      hideLabel={
        <span>
          Collapse Text <UpArrowIcon className="inline" aria-hidden="true" />
        </span>
      }
    >
      {description}
    </Spoiler>
  );
};
export default TextDescription;
