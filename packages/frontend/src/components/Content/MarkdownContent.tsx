import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

/**
 * Props for the MarkdownContent component.
 */
export interface MarkdownContentProps {
  /** Markdown string (or array of strings to be joined) to render */
  readonly content: string | string[];
  /** Optional Tailwind class names for the wrapper div */
  readonly className?: string;
}

/**
 * Renders Markdown content safely using react-markdown.
 *
 * - GitHub Flavored Markdown (tables, strikethrough, autolinks, task lists) via remark-gfm
 * - HTML sanitization via rehype-sanitize to strip dangerous elements
 * - Custom component overrides with Tailwind styling
 *
 * @example
 * ```tsx
 * <MarkdownContent content="## Hello\n\nSome **bold** text." />
 * ```
 */
const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  className,
}) => {
  const markdownString = Array.isArray(content) ? content.join('  \n') : content;

  return (
    <div className={className}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          h1: ({ node, ...rest }) => (
            <h1 className="text-2xl font-bold my-3" {...rest} />
          ),
          h2: ({ node, ...rest }) => (
            <h2 className="text-xl font-semibold my-2" {...rest} />
          ),
          h3: ({ node, ...rest }) => (
            <h3 className="text-lg font-semibold my-2" {...rest} />
          ),
          p: ({ node, ...rest }) => <p className="text-base my-1" {...rest} />,
          ol: ({ node, ...rest }) => (
            <ol className="list-decimal list-inside my-1" {...rest} />
          ),
          ul: ({ node, ...rest }) => (
            <ul className="list-disc list-inside my-1" {...rest} />
          ),
          li: ({ node, ...rest }) => (
            <li className="text-base ml-2" {...rest} />
          ),
          a: ({ node, ...rest }) => (
            <a
              className="text-accent underline hover:opacity-80"
              target="_blank"
              rel="noopener noreferrer"
              {...rest}
            />
          ),
          blockquote: ({ node, ...rest }) => (
            <blockquote
              className="border-l-4 border-base-lighter pl-4 italic my-2"
              {...rest}
            />
          ),
          code: ({ node, className: codeClassName, children, ...rest }) => {
            // If the code block has a language class, render as a block
            const isBlock = /language-/.test(codeClassName ?? '');
            return isBlock ? (
              <pre className="bg-base-lightest rounded p-3 overflow-x-auto my-2">
                <code className={codeClassName} {...rest}>
                  {children}
                </code>
              </pre>
            ) : (
              <code
                className="bg-base-lightest rounded px-1 py-0.5 text-sm"
                {...rest}
              >
                {children}
              </code>
            );
          },
          table: ({ node, ...rest }) => (
            <div className="overflow-x-auto my-2">
              <table
                className="min-w-full border-collapse border border-base-lighter"
                {...rest}
              />
            </div>
          ),
          th: ({ node, ...rest }) => (
            <th
              className="border border-base-lighter px-3 py-1 bg-base-lightest font-semibold text-left"
              {...rest}
            />
          ),
          td: ({ node, ...rest }) => (
            <td className="border border-base-lighter px-3 py-1" {...rest} />
          ),
        }}
      >
        {markdownString}
      </Markdown>
    </div>
  );
};

export default MarkdownContent;
