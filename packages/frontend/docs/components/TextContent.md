# TextContent Component Documentation

## Overview

The TextContent component is a versatile React component designed to render various types of text-based content with different formatting options. It supports multiple content types including plain text, HTML, Markdown, text arrays, and text with email or link attachments.

## Installation

```jsx
import TextContent, { ContentType } from './path/to/TextContent';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text | `string \| string[]` | Required | The content to be displayed. Can be a single string or an array of strings. |
| className | `string` | `'inline text-base-contrast-max font-medium margin-block-start-1 margin-block-end-1'` | Custom Tailwind CSS classes for styling the component. |
| type | `ContentType` | `ContentType.Text` | Determines how the content will be rendered. |
| email | `string` | `undefined` | Optional email address for TextWithEmail type. |
| link | `string` | `undefined` | Optional URL for TextWithLink type. |
| linkText | `string` | `undefined` | Optional display text for the link. |

## Content Types

The component supports six different content types through the `ContentType` enum:

### 1. Text (`ContentType.Text`)
- Basic text rendering
- Renders content in a simple `<div>` with a `<p>` tag
- Default content type if none specified

```jsx
<TextContent text="Hello, world!" />
```

### 2. Text Array (`ContentType.TextArray`)
- Renders an array of strings as separate paragraphs
- Each paragraph is wrapped in a `<p>` tag with `my-2` spacing
- Automatically generates unique keys using a hash function

```jsx
<TextContent
  type={ContentType.TextArray}
  text={["First paragraph", "Second paragraph"]}
/>
```

### 3. HTML (`ContentType.Html`)
- Renders HTML content using dangerouslySetInnerHTML
- Joins arrays into a single string if provided
- Wrapped in a `<p>` tag with custom styling

```jsx
<TextContent
  type={ContentType.Html}
  text="<strong>Bold</strong> and <em>italic</em> text"
/>
```

### 4. Markdown (`ContentType.Markdown`)
- Renders Markdown content using react-markdown
- Includes support for GitHub Flavored Markdown (GFM)
- Custom styling for paragraphs, lists, and list items
- Default text size of `text-lg` for paragraphs

```jsx
<TextContent
  type={ContentType.Markdown}
  text="# Header\n\nThis is **bold** text"
/>
```

### 5. Text With Email (`ContentType.TextWithEmail`)
- Combines text content with a clickable email link
- Email is appended to the text with proper formatting
- Uses Mantine's Anchor component for the email link

```jsx
<TextContent
  type={ContentType.TextWithEmail}
  text="Contact us at"
  email="example@domain.com"
/>
```

### 6. Text With Link (`ContentType.TextWithLink`)
- Combines text content with a clickable URL
- Optional custom link text
- Uses Mantine's Anchor component for the link

```jsx
<TextContent
  type={ContentType.TextWithLink}
  text="Visit our website at"
  link="https://example.com"
  linkText="Example.com"
/>
```

## Styling

The component uses Tailwind CSS for styling with a default className of:
```
inline text-base-contrast-max font-medium margin-block-start-1 margin-block-end-1
```

Custom styles can be added through the `className` prop and will be merged with default styles using `tailwind-merge`.

## Dependencies

The component requires the following dependencies:
- React
- react-markdown
- remark-gfm
- @mantine/core
- tailwind-merge

## Error Handling

- For TextWithLink type, displays "Link is not defined" if no link is provided
- Automatically converts text to string using toString() in default case
- Handles both string and string[] inputs gracefully

## Best Practices

1. **Content Type Selection**
   - Use plain Text for simple string content
   - Use TextArray for multiple paragraphs
   - Use Markdown for formatted content
   - Use HTML only when necessary due to security implications

2. **Styling**
   - Prefer using Tailwind classes for styling
   - Use className prop for custom styles
   - Avoid inline styles

3. **Performance**
   - Use TextArray for large content blocks
   - Provide unique content to avoid unnecessary re-renders
   - Consider memoization for frequently updated content

## Examples

### Basic Usage
```jsx
<TextContent text="Simple text content" />
```

### Markdown with Custom Styling
```jsx
<TextContent
  type={ContentType.Markdown}
  text="# Title\n\nContent with **bold** text"
  className="prose dark:prose-invert"
/>
```

### Text Array with Custom Styling
```jsx
<TextContent
  type={ContentType.TextArray}
  text={["First paragraph", "Second paragraph"]}
  className="text-lg font-serif"
/>
```

### Email Contact
```jsx
<TextContent
  type={ContentType.TextWithEmail}
  text="For support, please contact"
  email="support@example.com"
/>
```

### External Link
```jsx
<TextContent
  type={ContentType.TextWithLink}
  text="Check out our documentation at"
  link="https://docs.example.com"
  linkText="our docs site"
/>
```
