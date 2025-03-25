import React, { useEffect, useRef, useState, ReactElement } from 'react';
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
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isClamped, setClamped] = useState(false);

  useEffect(() => {
    // Function that should be called on window resize
    function handleResize() {
      if (textRef && textRef.current) {
        setClamped(textRef.current.scrollHeight > textRef.current.clientHeight);
      }
    }

    // Add event listener to window resize
    window.addEventListener('resize', handleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that it would only run on mount

  return (
    <>
      {!extend ? (
        <Text ref={textRef} size="sm" lineClamp={4}>
          {description}
        </Text>
      ) : (
        <Text size="sm">{description}</Text>
      )}
      {isClamped && (
        <button onClick={() => setExtend((extend) => !extend)}>
          <div className="flex text-xs font-semibold text-base-contrast-light">
            {!extend ? 'Extend Text' : 'Collapse Text'}{' '}
            <div className="my-auto">
              {!extend ? <DownArrowIcon /> : <UpArrowIcon />}
            </div>
          </div>
        </button>
      )}
    </>
  );
};

export default TextDescription;
