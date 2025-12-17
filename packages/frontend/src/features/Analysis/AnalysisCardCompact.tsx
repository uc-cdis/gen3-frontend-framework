import React, { useCallback } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import TextDescription from './TextDescription';
import { Button, Group, Image, Stack, Text } from '@mantine/core';
import { AnalysisToolConfiguration } from './types';
import { useRouter } from 'next/router';

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
  btnText,
}) => {
  const router = useRouter();

  const handleClick = useCallback(
    (href: string) => router.push(href),
    [router],
  );
  return (
    <Stack
      gap="xs"
      key={title}
      classNames={{
        root: 'rounded-lg border-3 border-contrast bg-base-max h-full max-w-90',
      }}
    >
      <div className="rounded-t-lg bg-secondary border-b-4 border-accent-warm h-10" />
      <div className="flex relative -mt-10 z-10 p-1 max-w-90">
        <div className="relative rounded-lg bg-base-lightest ml-5 border-4 border-base-light mx-1 w-1/4 aspect-square">
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
      <div className="flex flex-col ml-2 px-4 h-4/6 justify-between">
        <div className="flex flex-col">
          <Text
            fw="bold"
            classNames={{ root: 'font-header sm:text-lg lg:text-xl' }}
          >
            {title}
          </Text>
          {count && (
            <Text size="md" fw="semibold" c="base-contrast.5">
              {count?.toLocaleString()} {countUnits}
            </Text>
          )}
          <div
            className={count ? 'pt-2 min-h-20 h-full' : 'pt-7 min-h-20 h-full'}
          >
            <TextDescription description={description} />
          </div>
        </div>
        <Group className="mb-6">
          <Button
            color="accent.4"
            component={Link}
            href={href ?? '_blank'}
            onClick={(_event) => handleClick(href ?? '_blank')}
          >
            {btnText
              ? btnText
              : `Run ${type === 'application' ? 'App' : 'Notebook'}`}
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
