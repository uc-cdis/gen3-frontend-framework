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
import { AnalysisToolConfiguration } from './types';

type AnalysisCardCompactProps = Omit<AnalysisToolConfiguration, 'image'>;

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
      classNames={{
        root: 'rounded-lg border-3 border-contrast bg-base-max h-full',
      }}
    >
      <div className="rounded-t-lg bg-secondary border-b-4 border-accent-warm h-12" />
      <div className="flex relative -mt-10 z-10 p-2 max-w-90">
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
      <div className="flex flex-col ml-2 px-4 pb-2 h-full justify-between">
        <div className="flex flex-col">
          <Text
            fw="bold"
            classNames={{ root: 'font-header sm:text-xl lg:text-2xl' }}
          >
            {title}
          </Text>
          <Text size="md" fw="semibold" c="base-contrast.5">
            {count?.toLocaleString()} {countUnits}
          </Text>
          <div className="py-2 min-h-24 h-full">
            <TextDescription description={description} />
          </div>
        </div>
        <Group className="mb-4">
          <Button color="primary.4">
            Run {type === 'application' ? 'App' : 'Notebook'}
          </Button>
          {hasDemo && (
            <Button variant="outline" color="primary.4">
              Demo
            </Button>
          )}
        </Group>
      </div>
    </Stack>
  );
};

export default AnalysisCardCompact;
