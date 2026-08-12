import React from 'react';
import type { UseFormReturnType } from '@mantine/form';
import TextContent, { TextContentProps, ContentType } from './TextContent';
import {
  Checkbox,
  Radio,
  Select,
  Stack,
  TagsInput,
  TextInput,
  Textarea,
  Tooltip,
} from '@mantine/core';

/**
 * Enum representing various content types for form-based data.
 *
 * Each content type corresponds to a specific format or structure of content.
 */
export enum FormContentType {
  TextInput = 'TextInput', // mantine TextInput
  Email = 'Email', // mantine TextInput set to validate email
  Checkbox = 'Checkbox', // mantine Checkbox
  Textarea = 'Textarea', // mantine Textarea
  RadioGroup = 'RadioGroup', // mantine Radio.Group
  Select = 'Select', // mantine Select
  Tags = 'Tags', // mantine Tags
  CedarUserUUID = 'CedarUserUUID', // Cedar User ID text input
  ClinicalTrialID = 'ClinicalTrialID', // ClinicalTrials.gov ID text input
}

/**
 * Interface representing the properties for rendering form content.
 */
export interface FormContentProps extends Omit<
  TextContentProps,
  'type' | 'text'
> {
  readonly text?: TextContentProps['text']; // text requiered for TextContent
  readonly type?: FormContentType | ContentType; // type of content
  readonly label?: string; // form label requiered for form inputs
  readonly initialValue?: string; // optional initial value for form select component
  readonly data?: string[]; // optional data for form select component
  readonly description?: string; // optional discritions to go above form feild and below label
  readonly placeholder?: string; // optional placeholder text
  readonly disabled?: boolean; // optional grays out and makes feild uneditable
  readonly required?: boolean; // optional is requiered adds star to indicate requiered feild
  readonly tooltip?: string; // optional tooltip wrapper
  readonly keyString: string; // form key, when form is submitted key assigend to the value
  readonly form: UseFormReturnType<any, (values: any) => any>; // @mantine/form form object
}

/**
 * Renders form and textual content dynamically based on the provided type and additional properties.
 *
 * The `FormContent` function creates a user interface element conditioned on the type of input content, such as plain text, HTML, Markdown, or text arrays. It also provides default styling and customizable CSS class support.
 *
 * @param {Object} props - Properties for rendering the TextContent component.
 * @param {string | string[]} props.text - The TextContent content to be displayed. It can be a single string or an array of strings.
 * @param {string} [props.className=''] - Custom CSS classes to apply for styling. Defaults to no predefined inline style.
 * @param {ContentType} [props.type=ContentType.Text] - Specifies the type of content being passed. Determines how the content will be rendered.
 * @param {ContentType FormContentType} [props.type=FormContentType.TextInput] - Specifies the type of content being passed. Determines how the content will be rendered.
 * @param {string} props.label - Main label for feild
 * @param {string} props.description - discriptive text
 * @param {string} props.placeholder - placeholder text that replaced when user types
 * @param {boolean} props.disabled - is feild disabled
 * @param {boolean} props.required - is feild requiered
 * @param {string} props.tooltip - tooltip
 * @param {string} props.keyString - For mantine form to identify elements
 * @param {FormContentProps['form']} props.form - @mantine/form useForm() object
 * @returns {JSX.Element} A JSX element that renders the content dynamically based on the input type and properties.
 */
const FormContent = ({
  text,
  label,
  initialValue,
  data,
  description,
  placeholder,
  disabled,
  required,
  tooltip,
  className = '',
  type = ContentType.Text,
  keyString,
  form,
}: FormContentProps) => {
  //code for tooltips on form items
  let inputContainer;
  if (tooltip) {
    inputContainer = (children: React.ReactNode) => (
      <Tooltip label={tooltip}>{children}</Tooltip>
    );
  }

  switch (type) {
    case FormContentType.Email:
    case FormContentType.CedarUserUUID:
    case FormContentType.ClinicalTrialID:
    case FormContentType.TextInput: {
      return (
        <TextInput
          className={className}
          classNames={{
            label: 'text-sm font-bold',
            input: 'max-w-lg mt-2',
            description: 'text-sm text-[var(--mantine-color-text)]',
          }}
          label={label}
          description={description}
          placeholder={placeholder}
          disabled={disabled || form.submitting}
          required={required}
          inputContainer={inputContainer}
          key={form.key(keyString)}
          {...form.getInputProps(keyString)}
        />
      );
    }
    case FormContentType.Checkbox: {
      const CheckboxElement = (
        <Checkbox
          className={className}
          label={label}
          description={description}
          disabled={disabled || form.submitting}
          key={form.key(keyString)}
          {...form.getInputProps(keyString)}
        />
      );
      if (inputContainer) {
        return inputContainer(CheckboxElement);
      }
      return CheckboxElement;
    }
    case FormContentType.RadioGroup: {
      // Ensure text is an array before mapping over it
      const radioOptions = Array.isArray(text) ? text : text ? [text] : [];
      const RadioGroupElement = (
        <Radio.Group
          classNames={{
            root: className,
            label: 'text-sm font-bold',
            description: 'text-sm text-[var(--mantine-color-text)]',
          }}
          label={label}
          description={description}
          required={required}
          disabled={disabled || form.submitting}
          key={form.key(keyString)}
          {...form.getInputProps(keyString)}
        >
          <Stack mt="xs" gap="xs">
            {radioOptions.map((option) => (
              <Radio key={option} value={option} label={option} />
            ))}
          </Stack>
        </Radio.Group>
      );

      // Respect the existing tooltip wrapper wrapper logic if present
      if (inputContainer) {
        return inputContainer(RadioGroupElement);
      }
      return RadioGroupElement;
    }
    case FormContentType.Select: {
      const SelectElement = (
        <Select
          className={className}
          classNames={{
            label: 'text-sm font-bold',
            root: 'max-w-lg mt-2',
          }}
          data={data}
          defaultValue={initialValue}
          label={label}
          description={description}
          placeholder={placeholder}
          disabled={disabled || form.submitting}
          required={required}
          key={form.key(keyString)}
          {...form.getInputProps(keyString)}
        />
      );

      if (inputContainer) {
        return inputContainer(SelectElement);
      }
      return SelectElement;
    }
    case FormContentType.Tags: {
      return (
        <TagsInput
          label={label}
          classNames={{
            label: 'text-sm font-bold whitespace-pre-line',
            root: 'max-w-lg mt-2',
          }}
          placeholder={placeholder}
          key={form.key(keyString)}
          {...form.getInputProps(keyString)}
        />
      );
    }

    case FormContentType.Textarea: {
      return (
        <Textarea
          className={className}
          classNames={{
            label: 'text-sm font-bold',
            input: 'max-w-lg h-40 mt-2',
            description: 'text-sm text-[var(--mantine-color-text)]',
          }}
          label={label}
          description={description}
          placeholder={placeholder}
          disabled={disabled || form.submitting}
          required={required}
          inputContainer={inputContainer}
          key={form.key(keyString)}
          {...form.getInputProps(keyString)}
        />
      );
    }
    default:
      // this is for all TextContent types
      if (text) {
        return (
          <TextContent
            text={text}
            className={className}
            type={type as ContentType}
            key={keyString}
          />
        );
      }
  }
};
export default FormContent;
