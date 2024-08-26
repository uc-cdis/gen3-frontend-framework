import React, { ReactElement, ReactNode } from 'react';
import { Card, Text, Group, ThemeIcon } from '@mantine/core';

export interface MessageTextProps {
  message: string;
}

interface MessageTextColorProps extends MessageTextProps {
  color: string;
}

const MessageText: React.FunctionComponent<MessageTextColorProps> = ({
  message,
  color,
}: MessageTextColorProps): ReactElement => (
  <Text c={color} size="md" fw={500}>
    {message}
  </Text>
);

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

interface MessageCardProps {
  message: string;
  icon?: ReactElement;
  color?: string;
  size?: string | number;
}

const MessageCard: React.FunctionComponent<MessageCardProps> = ({
  message,
  icon,
  size = 'lg',
  color = 'utility.5',
}: MessageCardProps): ReactElement => (
  <CardContainer>
    <ThemeIcon color={color} variant="outline" radius="xl" size={size}>
      {icon}
    </ThemeIcon>
    <MessageText message={message} color={color} />{' '}
  </CardContainer>
);

export default MessageCard;
