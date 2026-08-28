import type { TextContentProps } from '../../../components/Content/TextContent';
import type { Gen3AppConfigData } from '../../../lib/content/types';
import type { ButtonVariant } from '@mantine/core';
import type { FormProps } from '../../../components/Content/Form';
import type { RemoteSupportConfiguration } from '@gen3/core';

export interface ConfigGenericRegistrationAccessRequestFormProps extends Gen3AppConfigData {
  content?: ReadonlyArray<TextContentProps>;
}

export interface genericRegistrationAccessRequestFormOutcomeProps extends Gen3AppConfigData {
  content?: ReadonlyArray<TextContentProps>;
  button?: {
    href: string;
    variant?: ButtonVariant;
    text: string;
  };
}

export enum FormOutcome {
  pending = 'pending',
  success = 'success',
  duplicateSubmission = 'duplicateSubmission',
}

export interface FormContentViewsConfig {
  [FormOutcome.success]: genericRegistrationAccessRequestFormOutcomeProps;
  [FormOutcome.duplicateSubmission]: genericRegistrationAccessRequestFormOutcomeProps;
}

export interface GenericRegistrationAccessRequestFormConfig extends FormContentViewsConfig {
  remoteSupportService: {
    service: string;
    submissionSubjectLine: string;
    configuration: RemoteSupportConfiguration;
  };
  disclaimer?: string;
  form: FormProps['body'];
}
