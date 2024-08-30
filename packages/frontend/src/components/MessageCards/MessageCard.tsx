import React, { ReactElement } from 'react';
import { Text, ThemeIcon } from '@mantine/core';
import CardContainer from './CardContainer';

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
