import React, { PropsWithChildren } from 'react';
import { Collapse, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  MdKeyboardArrowDown as DownArrowIcon,
  MdKeyboardArrowUp as UpArrowIcon,
} from 'react-icons/md';
import { createKeyboardAccessibleFunction } from '../../utils/keyboardAccessible';

interface SectionCollapseProps {
  readonly text: string;
}

const SectionCollapse = ({
  text,
  children,
}: PropsWithChildren<SectionCollapseProps>) => {
  const [expanded, { toggle }] = useDisclosure(true);

  return (
    <>
      <div
        className={`flex items-center gap-2 w-full bg-primary-lightest p-2 ${!expanded ? 'mb-4' : ''}`}
        onClick={toggle}
        onKeyDown={createKeyboardAccessibleFunction(toggle)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
      >
        <div className="rounded-full w-6 h-6 bg-primary-darker flex justify-center items-center">
          {expanded ? (
            <UpArrowIcon color="white" size={30} />
          ) : (
            <DownArrowIcon color="white" size={30} />
          )}
        </div>
        <Text>{text}</Text>
      </div>
      <Collapse expanded={expanded} className="w-full py-4">
        {children}
      </Collapse>
    </>
  );
};

export default SectionCollapse;
