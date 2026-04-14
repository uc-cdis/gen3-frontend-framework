import React from 'react';
import type { ToolRendererProps } from '../types';
import ToolRenderer from './ToolRenderer';
import { useChatContext } from '../context/ChatContext';

export const RegistryToolRenderer = ({
  part,
  messageId,
}: ToolRendererProps) => {
  const { tools } = useChatContext();

  // Strip the 'tool-' prefix to get the registry key
  // e.g. 'tool-field_lookup_tool' → 'field_lookup_tool'
  const toolName = part.type.replace(/^tool-/, '');

  console.log('Rendering tool:', toolName);
  const Registered = tools[toolName];

  if (Registered) {
    return <Registered part={part} messageId={messageId} />;
  }

  // Fall back to the generic card
  return <ToolRenderer part={part} messageId={messageId} />;
};
