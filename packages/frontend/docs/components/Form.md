# FormContent Component Documentation

## Overview

The FormContent component is a versatile React component designed to render various types of form feilds and text-based content with different formatting options. It supports multiple content types including TextInput, Email, Checkbox, Textarea, plain text, HTML, Markdown, and text arrays.

## Installation

```jsx
import FormContent, { FormContentProps, FormContentType } from './path/to/FormContent';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text | `string \| string[]` | Required for TextContent | See TextContent component |
| className | `string` | `'inline text-base-contrast-max font-medium margin-block-start-1 margin-block-end-1'` | Custom Tailwind CSS classes for styling the component. |
| type | `FormContentType` | `FormContentType.Text` | Determines how the content will be rendered. |
| label | `string` | Required for FormContent | Form label requiered for form inputs |
| description | `string` | Optional for FormContent | Form description text above form feild and below label |
| placeholder | `string` | Optional for FormContent | placeholder text |
| disabled | `string` | Optional for FormContent | Grays out from feild and makes uneditable |
| required | `string` | Optional for FormContent | Adds star to indicate requiered feild and adds validation to not allow empty |
| tooltip | `string` | Optional for FormContent | Form tooltip wrapper |
| keyString | `string` | Required for FormContent | Form key, when form is submitted key assigend to the value  |
| form | `string` | Required for FormContent | @mantine/form form object |


## Form Content Types

The component supports different content types through the `FormContentType` enum:

### 1. All types in Text TextContent component
- See [TextContent](./TextContent.md)

### 2. Text Input (`ContentType.TextInput`)
- Uses [Mantine TextInput](https://mantine.dev/core/text-input/)
- Renders form feild with defalt styling and @mantine/form hooks

```jsx
const form = useForm(); // use @mantine/form useForm
<FormContent
  type={ContentType.TextInput}
  label='Test Label'
  description='This is some description text that will go under the label'
  placeholder='placeholder text'
  required={true}
  tooltip='test tooltip'
  keyString='testFeild'
  form={form}
/>
```

### 3. Email Input (`ContentType.Email`)
- Same as Text Input has different type to make handling validation easer

```jsx
const form = useForm(); // use @mantine/form useForm
<FormContent
  type={ContentType.Email}
  label='Test Label'
  description='This is some description text that will go under the label'
  placeholder='placeholder text'
  required={true}
  tooltip='test tooltip'
  keyString='testEmail'
  form={form}
/>
```

### 4. Checkbox (`ContentType.Checkbox`)
- Uses [Mantine Checkbox](https://mantine.dev/core/checkbox/)
- Renders form feild with defalt styling and @mantine/form hooks

```jsx
const form = useForm(); // use @mantine/form useForm
<FormContent
  type={ContentType.Checkbox}
  label='Test Label'
  description='This is some description text that will go under the label'
  tooltip='test tooltip'
  keyString='testCheckbox'
  form={form}
/>
```

### 5. Textarea (`ContentType.Textarea`)
- Uses [Mantine Textarea](https://mantine.dev/core/textarea/)
- Renders form feild with defalt styling and @mantine/form hooks

```jsx
const form = useForm(); // use @mantine/form useForm
<FormContent
  type={ContentType.Textarea}
  label='Test Label'
  description='This is some description text that will go under the label'
  placeholder='placeholder text'
  required={true}
  tooltip='test tooltip'
  keyString='testTextarea'
  form={form}
/>
```


## Styling

The component uses Tailwind CSS for styling

Custom styles can be added through the `className` prop and will be appled to the compoent root level.

## Error Handling

- no error handaling at this level error handaling can be fed in via useForm


## Examples

### Basic Usage
```jsx
const form = useForm(); // use @mantine/form useForm
<FormContent
  type={ContentType.TextInput}
  label='Test Label'
  keyString='testFeild'
  form={form}
/>
```

### Full Usage
```jsx
const form = useForm(); // use @mantine/form useForm
<FormContent
  type={ContentType.TextInput}
  label='Test Label'
  description='This is some description text that will go under the label'
  placeholder='placeholder text'
  required={true}
  tooltip='test tooltip'
  keyString='testFeild'
  form={form}
/>
```
