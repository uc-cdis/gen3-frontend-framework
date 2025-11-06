import React, { ReactElement } from 'react';
import { Box, Spoiler } from '@mantine/core';
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
    <Box style={{ minHeight: 'calc(80px + 2rem)' }}>
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
    </Box>
  );
};
export default TextDescription;
