import React from 'react';
import { Card, Text } from '@mantine/core';
import { Icon } from '@iconify-icon/react';
import { type DataSubmissionCard } from './types';
import { IconSize } from '../../utils/sizes';

const DataSubmissionCard = ({
  title,
  subtitle,
  text,
  icon,
}: DataSubmissionCard) => {
  return (
    <Card className="w-full" padding="md" withBorder>
      <Card.Section className="p-1" withBorder>
        <Text className="text-sm text-center font-bold text-primary-darker">
          {title}
        </Text>
      </Card.Section>
      <div className="flex items-center gap-2 p-4">
        <Icon icon={icon} className="basis-1/4" height={IconSize['xl']} />
        <div className="basis-3/4">
          <Text className="text-sm font-bold mb-2">{subtitle}</Text>
          <Text className="text-sm">{text}</Text>
        </div>
      </div>
    </Card>
  );
};

export default DataSubmissionCard;
