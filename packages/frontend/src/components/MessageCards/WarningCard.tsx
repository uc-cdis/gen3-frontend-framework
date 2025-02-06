import React, { ReactElement } from 'react';
import { BsExclamationTriangle as IconAlertTriangle } from 'react-icons/bs';
import MessageCard, { type MessageTextProps } from './MessageCard';

const WarningCard: React.FunctionComponent<MessageTextProps> = ({
  message,
}: MessageTextProps): ReactElement => (
  <MessageCard
    message={message}
    icon={<IconAlertTriangle size={24} />}
    color="utility.2"
  />
);

export default WarningCard;
