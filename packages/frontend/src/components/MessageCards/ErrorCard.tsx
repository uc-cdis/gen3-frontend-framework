import React, { ReactElement } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import MessageCard, { type MessageTextProps } from './MessageCard';

const ErrorCard: React.FunctionComponent<MessageTextProps> = ({
  message,
}: MessageTextProps): ReactElement => (
  <MessageCard
    message={message}
    icon={<IconAlertTriangle size={24} />}
    color="utility.3"
  />
);

export default ErrorCard;
