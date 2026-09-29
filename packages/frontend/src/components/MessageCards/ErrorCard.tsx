import type { ReactElement } from 'react';
import React from 'react';
import { BsExclamationTriangle as IconAlertTriangle } from 'react-icons/bs';
import MessageCard, { type MessageTextProps } from './MessageCard';

const ErrorCard: React.FunctionComponent<MessageTextProps> = ({
  message,
}: MessageTextProps): ReactElement => (
  <MessageCard
    message={message}
    icon={
      <IconAlertTriangle
        style={{ width: '75%', height: '75%', marginBottom: '5px' }}
      />
    }
    color="utility.3"
  />
);

export default ErrorCard;
