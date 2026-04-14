import React from 'react';
import { Streamdown } from 'streamdown';
import { code } from '@streamdown/code';
import { math } from '@streamdown/math';
import { mermaid } from '@streamdown/mermaid';
import 'streamdown/styles.css'; // base styles required by Streamdown
import 'katex/dist/katex.min.css';
import { convertLatexDelimiters } from '../utils'; // required if using math

// ─── StreamingMarkdown ────────────────────────────────────────────────────────

export interface StreamingMarkdownProps {
  /** The markdown string — may be partial/incomplete while streaming. */
  content: string;
  /**
   * When true, Streamdown renders its built-in streaming caret and
   * smooth animations for unterminated blocks (bold, code fences, etc.).
   * Pass `status === 'streaming'` from useChatContext.
   */
  isStreaming?: boolean;
  /** Optional className forwarded to the Streamdown container. */
  className?: string;
}

export const StreamingMarkdown = ({
  content,
  isStreaming = false,
  className,
}: StreamingMarkdownProps) => {
  return (
    <Streamdown
      plugins={{ code, math, mermaid }}
      isAnimating={isStreaming}
      className={className}
    >
      {convertLatexDelimiters(content)}
    </Streamdown>
  );
};

export default StreamingMarkdown;
