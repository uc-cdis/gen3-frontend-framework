import React, { ReactElement, ReactNode } from 'react';
import { Card, Group } from '@mantine/core';

interface CardContainerProps {
  children: ReactNode;
}

const CardContainer: React.FunctionComponent<CardContainerProps> = ({
  children,
}: CardContainerProps): ReactElement => (
  <div className="flex justify-center pt-2 items-center">
    <Card
      shadow="sm"
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
