import React from 'react';

import { hashCode } from '../../utils/hash';
import MarkdownContent from './MarkdownContent';

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
  Chart = 'chart',
  Statistics = 'statistics',
}

/**
 * Interface representing the properties for rendering text content.
 */
export interface TextContentProps {
  readonly text: string | string[]; // text to show. Arrays of text will be inside of a html paragraph (i.e <p>) tag
  readonly className?: string; // tailwind based styling to apply to the text content
  readonly type?: ContentType; // type of content (see ContentType)
}

/**
 * Renders textual content dynamically based on the provided type and additional properties.
 *
 * The `TextContent` function creates a user interface element conditioned on the type of input content, such as plain text, HTML, Markdown, or text arrays. It also provides default styling and customizable CSS class support.
 *
 * @param {Object} props - Properties for rendering the TextContent component.
 * @param {string | string[]} props.text - The content to be displayed. It can be a single string or an array of strings.
 * @param {string} [props.className='inline text-base-contrast-max font-medium margin-block-start-1 margin-block-end-1'] - Custom CSS classes to apply for styling. Defaults to a predefined inline style.
 * @param {ContentType} [props.type=ContentType.Text] - Specifies the type of content being passed. Determines how the content will be rendered.
 * @returns {JSX.Element} A JSX element that renders the content dynamically based on the input type and properties.
 */
const TextContent = ({
  text,
  className = 'inline text-base-contrast-max font-medium margin-block-start-1 margin-block-end-1 text-base',
  type = ContentType.Text,
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
        <div className={className} role="list">
          <style>
            {/* making sure tailwind loads imported classes */}
            @source inline({className});
          </style>
          {textArray.map((item) => (
            <p className="my-2" key={hashCode(item)} role="listitem">
              {item}
            </p>
          ))}
        </div>
      );
    }
    case ContentType.Markdown: {
      return <MarkdownContent content={text} className={className}/>;
    }
    case ContentType.Text:
    default:
      return (
        <div className={className}>
          <style>
            {/* making sure tailwind loads imported classes */}
            @source inline({className});
          </style>
          <p>{text.toString()}</p>
        </div>
      );
  }
};
export default TextContent;
