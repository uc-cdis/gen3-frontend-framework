import React, { useMemo } from 'react';
import { MantineProvider } from '@mantine/core';
import { Gen3Copilot } from '../../features/ai';

const M3_API_URL = 'https://copilot.m3aicommons.org/api/chat';
const ASSISTANT_MODEL = 'openai:openai/gpt-oss-120b';

export default function ChatPage() {
  const ChatApp = useMemo(
    () =>
      Gen3Copilot({
        api: M3_API_URL,
        body: { model: ASSISTANT_MODEL },
      }),
    [],
  );
  return (
    <MantineProvider>
      <div className="w-full h-full" >
        <ChatApp />
      </div>
    </MantineProvider>
  );
}
