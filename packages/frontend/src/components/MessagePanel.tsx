import React from 'react';
import { Paper, Text } from '@mantine/core';

interface Message {
  message: string;
  code?: string;
  isError?: boolean;
}

const MessagePanel = ({ message, isError = false }: Message) => {
  return (
    <div className="relative w-full flex flex-col">
      <Paper shadow="md" radius="lg" p="md">
        <div className="w-1/2 mx-auto text-center mt-4 bg-base-lightest hover:bg-base-lighter p-4 border-bg-base-light border-r-8">
          <Text
            size="lg"
            fw="bold"
            color={isError ? 'red' : 'primary-contrast'}
          >
            {message}
          </Text>
        </div>
      </Paper>
    </div>
  );
};


export default MessagePanel;
