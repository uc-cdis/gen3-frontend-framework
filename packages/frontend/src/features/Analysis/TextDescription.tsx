import React, { useState, ReactElement } from 'react';
import { Text } from '@mantine/core';
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
  const [extend, setExtend] = useState(false);
  return (
    <>
      {!extend ? (
        <Text size="sm" lineClamp={4}>
          {description}
        </Text>
      ) : (
        <Text size="sm">{description}</Text>
      )}
      {
        <button onClick={() => setExtend((extend) => !extend)}>
          <div className="flex text-xs font-semibold text-base-contrast-light">
            {!extend ? 'Extend Text' : 'Collapse Text'}{' '}
            <div className="my-auto">
              {!extend ? <DownArrowIcon /> : <UpArrowIcon />}
            </div>
          </div>
        </button>
      }
    </>
  );
};

export default TextDescription;
