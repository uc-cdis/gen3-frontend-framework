import React, { HTMLProps } from 'react';
import {
  Anchor,
  Button,
  Group,
  Image,
  NavLink,
  Stack,
  Text,
} from '@mantine/core';
import NextImage from 'next/image';
import TextDescription from './TextDescription';
import Link from 'next/link';
import { AnalysisToolConfig } from './types';

type AnalysisCardCompactProps = Omit<AnalysisToolConfig, 'image'>;

const AnalysisCardCompact: React.FC<AnalysisCardCompactProps> = ({
  title,
  description,
  type = 'application',
  icon,
  hasDemo = false,
  loginRequired = false,
  href,
  counts,
  countUnits,
}) => {
  return (
    <Stack key={title}>
      <div className="rounded-sm bg-primary border-b-8 border-accent h-10" />
      <div className="flex -mt-8 relative z-10">
        <div className="p-0.5 relative rounded-sm bg-base-lightest ml-5 border-2 border-base w-1/4 aspect-square">
          <Image
            component={NextImage}
            src={`${icon}`}
            alt={`${title} logo`}
            fill
            fit="cover"
            radius="lg"
          />
        </div>
      </div>
      <div className="flex flex-col mt-2 ml-2">
        <Text fw="bold">{title}</Text>
        <div className="p-2 h-fit">
          <TextDescription description={description} />
        </div>
        <Group>
          <Button>Run {type === 'application' ? 'App' : 'Notebook'}</Button>
          {hasDemo && (
            <Button variant="outline" c="primary.4">
              Demo
            </Button>
          )}
        </Group>
      </div>
    </Stack>
  );
};

export default AnalysisCardCompact;
