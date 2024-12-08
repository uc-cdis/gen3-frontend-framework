import React, { ReactElement, ReactNode } from 'react';
import { Card, Group } from '@mantine/core';

interface CardContainerProps {
  children: ReactNode;
  width?: string;
}

const CardContainer: React.FunctionComponent<CardContainerProps> = ({
  children,
  width = 'w-1/2',
}: CardContainerProps): ReactElement => (
  <div className={`flex justify-center pt-2 items-center m-2 ${width ?? ''}`}>
    <Card
      shadow="xs"
      p="md"
      className="bg-base-lightest border-2 border-base-lighter"
    >
      <Group align="center" wrap="nowrap">
        {children}
      </Group>
    </Card>
  </div>
);

export default CardContainer;
