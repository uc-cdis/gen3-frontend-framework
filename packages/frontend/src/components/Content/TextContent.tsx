import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { hashCode } from '../../utils/hash';
import { twMerge } from 'tailwind-merge';
import { Anchor } from '@mantine/core';

/**
 * Enum representing various content types for text-based data.
 *
 * Each content type corresponds to a specific format or structure of textual content.
 */
export enum ContentType {
  Text = 'text', // a text string
  TextArray = 'textArray', // a array of text, each is a paragraph
  Html = 'html', // text content is HTML
  Markdown = 'markdown', // text content is Markdown
  TextWithEmail = 'textWithEmail', // text is a string and the email field is appended to it
  TextWithLink = 'textWithLink', // test followed by a link
}

/**
 * Interface representing the properties for rendering text content.
 */
export interface TextContentProps {
  readonly text: string | string[]; // text to show. Arrays of text will be inside of a html paragraph (i.e <p>) tag
  readonly className?: string; // tailwind based styling to apply to the text content
  readonly type?: ContentType; // type of content (see ContentType)
  readonly email?: string; // email used for type = textWithEmail
  readonly link?: string; // link used for type = textWithLink
  readonly linkText?: string; // optional text for link
}

/**
 * Renders textual content dynamically based on the provided type and additional properties.
 *
 * The `TextContent` function creates a user interface element conditioned on the type of input content, such as plain text, HTML, Markdown, text arrays, text with email links, or text with hyperlinks. It also provides default styling and customizable CSS class support.
 *
 * @param {Object} props - Properties for rendering the TextContent component.
 * @param {string | string[]} props.text - The content to be displayed. It can be a single string or an array of strings.
 * @param {string} [props.className='inline text-base-contrast-max font-medium margin-block-start-1 margin-block-end-1'] - Custom CSS classes to apply for styling. Defaults to a predefined inline style.
 * @param {ContentType} [props.type=ContentType.Text] - Specifies the type of content being passed. Determines how the content will be rendered.
 * @param {string} [props.email] - Optional email address to be rendered as a clickable "mailto" link when type is `ContentType.TextWithEmail`.
 * @param {string} [props.link] - Optional URL to be rendered as a clickable hyperlink when type is `ContentType.TextWithLink`.
 * @param {string} [props.linkText] - Optional link text to display instead of the raw URL when type is `ContentType.TextWithLink`.
 * @returns {JSX.Element} A JSX element that renders the content dynamically based on the input type and properties.
 */
const TextContent = ({
  text,
  className = 'inline text-base-contrast-max font-medium margin-block-start-1 margin-block-end-1',
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
          aria-label="HTML content" // Provide context for HTML rendered content
        />
      );
    }
    case ContentType.TextArray: {
      const textArray = !Array.isArray(text) ? [text] : text;
      return (
        <div className={className} role="list" aria-label="Text array">
          {textArray.map((item) => (
            <p className="my-2" key={hashCode(item)} role="listitem">
              {item}
            </p>
          ))}
        </div>
      );
    }
    case ContentType.Markdown: {
      const textString = Array.isArray(text) ? text.join('') : text;
      return (
        <div aria-label="Markdown content">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              p(props: any) {
                const { node, ...rest } = props;
                return <p className="text-lg my-1" {...rest} />;
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
        'inline text-base-contrast-max font-medium margin-block-start-1 margin-block-end-1';
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
                aria-label={`Send an email to ${email}`} // Provide label for email purpose
              >
                {` ${email}.`}
              </Anchor>
            )}
          </span>
        </div>
      );
    }
    case ContentType.TextWithLink: {
      const DEFAULT_STYLE =
        'inline text-base-contrast-max font-medium margin-block-start-1 margin-block-end-1';
      const mergedClassname = className
        ? twMerge(DEFAULT_STYLE, className)
        : DEFAULT_STYLE;
      const textString = Array.isArray(text) ? text.join('') : text;
      if (!link) {
        return (
          <div className={mergedClassname} aria-label="No link defined">
            Link is not defined.
          </div>
        );
      }

      return (
        <div className={mergedClassname}>
          <span>
            {textString}
            {link && (
              <Anchor
                classNames={{ root: mergedClassname }}
                href={link}
                aria-label={`Visit the link: ${linkText || link}`} // Label to clarify the link purpose
              >
                {` ${linkText ?? link}.`}
              </Anchor>
            )}
          </span>
        </div>
      );
    }
    case ContentType.Text:
    default:
      return (
        <div className={className} aria-label="Plain text content">
          <p>{text.toString()}</p>
        </div>
      );
  }
};
export default TextContent;
