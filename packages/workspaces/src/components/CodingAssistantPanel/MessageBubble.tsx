import React, { useMemo } from "react";
import { Button } from "@mantine/core";
import { UIMessage } from "./types";

function extractCodeBlocks(text: string): Array<{ lang: string; code: string }> {
  // Regex defined inside the function to avoid shared lastIndex state across calls
  // (module-level /g regexes retain lastIndex between invocations).
  const CODE_BLOCK_RE = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: Array<{ lang: string; code: string }> = [];
  let match: RegExpExecArray | null;
  while ((match = CODE_BLOCK_RE.exec(text)) !== null) {
    blocks.push({ lang: match[1] ?? '', code: match[2].trim() });
  }
  return blocks;
}

const MessageBubble = ({
  message,
  onInsert,
}: {
  message: UIMessage;
  onInsert: (code: string) => void;
}) => {
  const isUser = message.role === 'user';
  const codeBlocks = useMemo(() => extractCodeBlocks(message.content), [message.content]);

  // Render content with code blocks highlighted
  const renderedContent = useMemo(() => {
    if (!message.content) return null;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const re = /```(\w+)?\n([\s\S]*?)```/g;

    while ((match = re.exec(message.content)) !== null) {
      // Text before code block
      if (match.index > lastIndex) {
        parts.push(
          <span key={`t-${lastIndex}`} className="whitespace-pre-wrap">
            {message.content.slice(lastIndex, match.index)}
          </span>,
        );
      }

      const lang = match[1] ?? '';
      const code = match[2].trim();
      parts.push(
        <div key={`c-${match.index}`} className="my-1.5 rounded-md bg-base-darkest">
          <div className="flex items-center justify-between px-2.5 py-1 text-xs text-base-dark">
            <span>{lang || 'code'}</span>
            <Button
              onClick={() => onInsert(code)}
              color="accent"
            >
              Insert ↗
            </Button>
          </div>
          <pre className="overflow-x-auto px-2.5 pb-2 text-sm leading-relaxed text-utility-category4">
            <code>{code}</code>
          </pre>
        </div>,
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < message.content.length) {
      parts.push(
        <span key={`t-${lastIndex}`} className="whitespace-pre-wrap">
          {message.content.slice(lastIndex)}
        </span>,
      );
    }

    return parts;
  }, [message.content, onInsert]);

  return (
    <div
      className={`rounded-lg px-2.5 py-2 text-xs leading-relaxed ${
        isUser
          ? 'bg-utility-category1 bg-opacity-10 text-utility-category1'
          : 'bg-base-lightest bg-opacity-50 text-base-darkest'
      }`}
    >
      <div className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-base-dark">
        {isUser ? 'You' : message.streaming ? 'AI ●' : 'AI'}
      </div>
      <div>{renderedContent}</div>
    </div>
  );
};

export default MessageBubble;
