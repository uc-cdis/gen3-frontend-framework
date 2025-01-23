import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { hashCode } from '../../utils/hash';
import { twMerge } from 'tailwind-merge';
import { Anchor } from '@mantine/core';

export enum ContentType {
  Text = 'text',
  TextArray = 'textArray',
  Html = 'html',
  Markdown = 'markdown',
  TextWithEmail = 'textWithEmail',
  TextWithLink = 'textWithLink',
  Link = 'link',
}

export interface TextContentProps {
  readonly text: string | string[];
  readonly className?: string;
  readonly type?: ContentType;
  readonly email?: string;
  readonly link?: string;
  readonly linkText?: string;
}
const TextContent = ({
  text,
  className = 'inline text-base-contrast-min font-medium margin-block-start-1 margin-block-end-1',
  type = ContentType.Text,
  email = undefined,
  link = undefined,
  linkText = undefined,
}: TextContentProps) => {
  switch (type) {
    case ContentType.Html: {
      const textString = Array.isArray(text) ? text.join('') : text;
      return (
        <p
          className={className}
          dangerouslySetInnerHTML={{ __html: textString }}
        />
      );
    }
    case ContentType.TextArray: {
      const textArray = !Array.isArray(text) ? [text] : text;
      return (
        <div className={className}>
          {textArray.map((item) => (
            <p className="my-2" key={hashCode(item)}>
              {item}
            </p>
          ))}
        </div>
      );
    }
    case ContentType.Markdown: {
      const textString = Array.isArray(text) ? text.join('') : text;
      return (
        <div>
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              // define some formatting for the ai response
              p(props: any) {
                const { node, ...rest } = props;
                return (
                  <p className="text-lg text-primary-contrast my-1" {...rest} />
                );
              },
              ol(props: any) {
                const { node, ...rest } = props;
                return <ol className="list-disc list-inside my-1" {...rest} />;
              },
              ul(props: any) {
                const { node, ...rest } = props;
                return <ul className="list-disc list-inside my-1" {...rest} />;
              },
              li(props: any) {
                const { node, ...rest } = props;
                return <li className="text-md" {...rest} />;
              },
            }}
          >
            {textString}
          </Markdown>
        </div>
      );
    }
    case ContentType.TextWithEmail: {
      const DEFAULT_STYLE =
        'inline text-base-contrast-min font-medium margin-block-start-1 margin-block-end-1';
      const mergedClassname = className
        ? twMerge(DEFAULT_STYLE, className)
        : DEFAULT_STYLE;
      const textString = Array.isArray(text) ? text.join('') : text;
      return (
        <div className={mergedClassname}>
          <span>
            {textString}
            {email && (
              <Anchor
                classNames={{ root: mergedClassname }}
                href={`mailto:${email}`}
              >{` ${email}.`}</Anchor>
            )}
          </span>
        </div>
      );
    }
    case ContentType.TextWithLink: {
      const DEFAULT_STYLE =
        'inline text-base-contrast-min font-medium margin-block-start-1 margin-block-end-1';
      const mergedClassname = className
        ? twMerge(DEFAULT_STYLE, className)
        : DEFAULT_STYLE;
      const textString = Array.isArray(text) ? text.join('') : text;
      if (!link) {
        return <div className={mergedClassname}> Link is not defined.</div>;
      }

      return (
        <div className={mergedClassname}>
          <span>
            {textString}
            {link && (
              <Anchor
                classNames={{ root: mergedClassname }}
                href={link}
              >{` ${linkText ?? link}.`}</Anchor>
            )}
          </span>
        </div>
      );
    }
    case ContentType.Text:
    default:
      return (
        <div className={className}>
          <p>{text.toString()}</p>
        </div>
      );
  }
};

export default TextContent;
