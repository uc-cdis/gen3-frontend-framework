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
  count,
  countUnits,
}) => {
  return (
    <Stack
      gap="xs"
      key={title}
      classNames={{ root: 'rounded-lg border-2 border-base' }}
    >
      <div className="rounded-t-lg bg-primary border-b-8 border-accent h-10" />
      <div className="flex relative -mt-12 z-10 p-2">
        <div className="relative rounded-lg bg-base-lightest ml-5 border-4 border-base-light mx-2 w-1/4 aspect-square">
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
      <div className="flex flex-col ml-2 px-4 pb-2">
        <Text size="xl" fw="bold">
          {title}
        </Text>
        <Text size="md" fw="semibold" c="base-contrast.5">
          {count?.toLocaleString()} {countUnits}
        </Text>
        <div className="py-2 h-3/4">
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
