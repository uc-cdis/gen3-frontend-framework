import React from 'react';
import { Icon } from '@iconify-icon/react';

interface ErrorMessageProps {
  readonly message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
}: ErrorMessageProps) => (
  <span className="flex items-center mt-2 text-utility-error">
    <Icon icon="gen3:waring" height="1rem" />
    {message}
  </span>
);

export default ErrorMessage;
