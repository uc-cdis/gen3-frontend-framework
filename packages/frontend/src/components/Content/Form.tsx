import React from 'react';
import type { FormContentProps } from './FormContent';
import FormContent, { FormContentType } from './FormContent';
import { Button, Text } from '@mantine/core';
import type { FormValidateInput, UseFormReturnType } from '@mantine/form';
import { useForm, isEmail, isNotEmpty } from '@mantine/form';
import { isCedarUUIDValid, isClinicalTrialIDValid } from './formValidators';

interface FormPropsBody extends Omit<FormContentProps, 'keyString' | 'form'> {
  readonly errorText: string; // text to display on error
  readonly variable?: string; // form feild variable name
  readonly required?: boolean;
}

export interface FormOnSubmitReturnProps {
  [key: string]: string;
}

/**
 * Interface representing the properties for rendering a form.
 */
export interface FormProps {
  readonly className?: string; // tailwind based styling to apply to the form container
  readonly submitButtonText?: string; // submit Button Text defalts to Submit
  readonly showResetButton?: boolean; // Determines if the reset button should be visible
  readonly body: FormPropsBody[]; // array of FormContent
  readonly onSubmit: (
    values: FormOnSubmitReturnProps,
  ) => void | Promise<unknown>; // function to trigger on form submit
  readonly errorMessage?: string; // error messaage to display above submit button
}

/**
 * Renders Form content dynamically based on the provided body and additional properties.
 *
 * The `TextContent` function creates a user interface element conditioned on the type of input content, such as plain text, HTML, Markdown, or text arrays. It also provides default styling and customizable CSS class support.
 *
 * @param {Object} props - Properties for rendering the Form component.
 * @param {string | string[]} props.text - The content to be displayed. It can be a single string or an array of strings.
 * @param {string} [props.className='inline text-base-contrast-max font-medium margin-block-start-1 margin-block-end-1'] - Custom CSS classes to apply for styling. Defaults to a predefined inline style.
 * @param {ContentType} [props.type=ContentType.Text] - Specifies the type of content being passed. Determines how the content will be rendered.
 * @returns {JSX.Element} A JSX element that renders the content dynamically based on the input type and properties.
 */
const Form = ({
  className = '',
  body,
  submitButtonText = 'Submit',
  showResetButton = false,
  onSubmit,
  errorMessage,
}: FormProps) => {
  const initialValues: FormOnSubmitReturnProps = {};
  const validate: FormValidateInput<FormOnSubmitReturnProps> = {};

  const bodyWithKey: (FormPropsBody & { keyString: string })[] = body.map(
    (item, index) => {
      const itemKey =
        item.variable ||
        `${index}${item.type || ''}${item.label || ''}`.replace(
          /[^a-zA-Z0-9]/g,
          '',
        );

      if (item.type && item.type in FormContentType && item.label) {
        if (item.initialValue) {
          initialValues[itemKey] = item.initialValue;
        }
        if (item.type === 'Email') {
          const isvalidEmail = item.errorText || 'Invalid email';
          validate[itemKey] = isEmail(isvalidEmail);
        }
        if (item.type === FormContentType.ClinicalTrialID) {
          validate[itemKey] = isClinicalTrialIDValid(item.errorText);
        }
        if (item.required) {
          switch (item.type) {
            case FormContentType.CedarUserUUID: {
              validate[itemKey] = isCedarUUIDValid(item.errorText);
              break;
            }
            case FormContentType.ClinicalTrialID: {
              validate[itemKey] = isClinicalTrialIDValid(item.errorText);
              break;
            }
            case FormContentType.Email: {
              const isValidEmail = item.errorText || 'Invalid email';
              validate[itemKey] = isEmail(isValidEmail);
              break;
            }
            case FormContentType.Checkbox: {
              const isValidCheckbox = item.errorText || 'Must be checked';
              validate[itemKey] = isNotEmpty(isValidCheckbox);
              break;
            }
            default: {
              const isValidText = item.errorText || `${item.label} is required`;
              validate[itemKey] = isNotEmpty(isValidText);
            }
          }
        }
      }
      // add key
      return { ...item, keyString: itemKey };
    },
  );

  const form = useForm<FormOnSubmitReturnProps>({
    mode: 'uncontrolled',
    validateInputOnBlur: true,
    initialValues,
    validate,
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)} className={className}>
      {bodyWithKey.map((content, index) => (
        <FormContent
          {...content}
          form={form as unknown as UseFormReturnType<any, (values: any) => any>}
          key={index}
        />
      ))}
      {errorMessage && <Text c="red">{errorMessage}</Text>}
      <Button
        type="submit"
        disabled={form.submitting}
        loading={form.submitting}
      >
        {submitButtonText}
      </Button>
      {showResetButton && (
        <Button
          className="ml-2"
          variant="outline"
          onClick={form.reset}
          disabled={form.submitting}
        >
          Reset
        </Button>
      )}
    </form>
  );
};
export default Form;
