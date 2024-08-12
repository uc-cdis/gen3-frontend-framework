import React, { ReactElement } from 'react';
import { Card, Text, Group, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface ErrorCardProps {
  message: string;
  icon?: ReactElement;
}

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FunctionComponent<ErrorMessageProps> = ({
  message,
}: ErrorMessageProps): ReactElement => (
  <Text color="utility.4" size="md" fw="md">
    {message}
  </Text>
);

interface CardContainerProps {
  children: React.ReactNode;
}

const CardContainer: React.FunctionComponent<CardContainerProps> = ({
  children,
}: CardContainerProps): ReactElement => (
  <div className="flex justify-center pt-10 items-center">
    <Card
      shadow="sm"
      p="lg"
      className="bg-base-lightest border-2 border-base-lighter"
    >
      <Group align="center">
        <ThemeIcon color="utility.4" variant="outline" radius="xl" size="lg">
          <IconAlertTriangle size={24} />
        </ThemeIcon>
        {children}
      </Group>
    </Card>
  </div>
);
const ErrorCard: React.FunctionComponent<ErrorCardProps> = ({
  message,
}: ErrorCardProps): ReactElement => (
  <CardContainer>
    <ErrorMessage message={message} />{' '}
  </CardContainer>
);

export default ErrorCard;
